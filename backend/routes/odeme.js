const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

// Plan bilgileri ve fiyatlar
const PLANLAR = {
  pro: {
    ad: 'Çiftçi Pro',
    fiyat: 199,
    para: 'TRY',
    hayvanLimiti: null, // sınırsız
    aciklama: 'Sınırsız hayvan, tüm raporlar, AI danışman, karlılık analizi',
    roller: ['ciftci', 'sutcu']
  },
  vet_pro: {
    ad: 'Veteriner Pro',
    fiyat: 299,
    para: 'TRY',
    hayvanLimiti: null,
    aciklama: 'Sınırsız hasta, fatura & tahsilat, reçete PDF, aylık rapor',
    roller: ['veteriner']
  },
  isletme: {
    ad: 'İşletme Planı',
    fiyat: 999,
    para: 'TRY',
    hayvanLimiti: null,
    aciklama: 'Tüm roller, öncelikli destek, API erişimi',
    roller: ['ciftci', 'veteriner', 'toplayici']
  }
};

// Mevcut abonelik bilgisi
router.get('/abonelik', auth, async (req, res) => {
  try {
    const userId = req.originalUserId || req.userId;
    const user = await User.findById(userId).select('tenantId rol');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    const tenant = await Tenant.findById(user.tenantId);
    if (!tenant) {
      return res.json({
        plan: 'free',
        planEndsAt: null,
        subscriptionStatus: 'canceled',
        trialEndsAt: null,
        aktif: false,
        trialKalanGun: 0
      });
    }

    const simdi = new Date();
    const trialBitti = tenant.trialEndsAt ? simdi > new Date(tenant.trialEndsAt) : true;
    const planBitti = tenant.planEndsAt ? simdi > new Date(tenant.planEndsAt) : false;

    const aktif =
      (tenant.plan === 'trial' && !trialBitti) ||
      (['pro', 'vet_pro', 'isletme'].includes(tenant.plan) && !planBitti);

    const trialKalanGun = tenant.trialEndsAt
      ? Math.max(0, Math.ceil((new Date(tenant.trialEndsAt) - simdi) / (1000 * 60 * 60 * 24)))
      : 0;
    const planKalanGun = tenant.planEndsAt
      ? Math.max(0, Math.ceil((new Date(tenant.planEndsAt) - simdi) / (1000 * 60 * 60 * 24)))
      : 0;

    res.json({
      plan: tenant.plan,
      planEndsAt: tenant.planEndsAt,
      subscriptionStatus: tenant.subscriptionStatus,
      trialEndsAt: tenant.trialEndsAt,
      hayvanLimiti: tenant.hayvanLimiti,
      aktif,
      trialKalanGun,
      planKalanGun
    });
  } catch (error) {
    console.error('Abonelik bilgisi error:', error);
    res.status(500).json({ message: 'Abonelik bilgisi alınamadı.' });
  }
});

// Ödeme checkout başlatma (İyzico — basit form token)
// Not: Gerçek ortamda İyzico SDK kurulumu ve API key'ler gerekir
router.post('/checkout', auth, async (req, res) => {
  try {
    const { planKey } = req.body;
    const plan = PLANLAR[planKey];
    if (!plan) return res.status(400).json({ message: 'Geçersiz plan.' });

    const userId = req.originalUserId || req.userId;
    const user = await User.findById(userId).select('isim email tenantId rol');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    // Plan rolüne uygun mu?
    if (!plan.roller.includes(user.rol)) {
      return res.status(400).json({ message: `Bu plan ${plan.roller.join(', ')} rolleri için geçerli.` });
    }

    // İyzico ortamı hazırsa gerçek entegrasyon, değilse demo mod
    const iyzipayApiKey = process.env.IYZIPAY_API_KEY;
    const iyzipaySecretKey = process.env.IYZIPAY_SECRET_KEY;
    const iyzipayBaseUrl = process.env.IYZIPAY_BASE_URL || 'https://sandbox-api.iyzipay.com';

    if (!iyzipayApiKey || !iyzipaySecretKey) {
      // Demo mod: direkt aktivasyon (test ortamı)
      return res.json({
        mod: 'demo',
        mesaj: 'Test ortamı: Ödeme simüle ediliyor. Gerçek ortamda İyzico entegrasyonu gerekir.',
        plan: plan.ad,
        fiyat: plan.fiyat,
        demoActivateUrl: `/api/odeme/demo-aktif?planKey=${planKey}&userId=${userId}`
      });
    }

    // İyzico entegrasyonu (Iyzipay paketi gerektirir: npm install iyzipay)
    // Bu kısım gerçek ortamda aktifleştirilecek
    res.status(501).json({
      message: 'İyzico entegrasyonu için IYZIPAY_API_KEY ve IYZIPAY_SECRET_KEY ortam değişkenlerini ayarlayın.'
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Ödeme başlatılamadı.' });
  }
});

// Demo aktivasyon (test ortamı için — gerçek ortamda sadece webhook çalışır)
router.get('/demo-aktif', auth, async (req, res) => {
  try {
    const { planKey } = req.query;
    const plan = PLANLAR[planKey];
    if (!plan) return res.status(400).json({ message: 'Geçersiz plan.' });

    const userId = req.originalUserId || req.userId;
    const user = await User.findById(userId).select('tenantId');
    if (!user?.tenantId) return res.status(404).json({ message: 'Tenant bulunamadı.' });

    const planEndsAt = new Date();
    planEndsAt.setMonth(planEndsAt.getMonth() + 1);

    await Tenant.findByIdAndUpdate(user.tenantId, {
      plan: planKey,
      planEndsAt,
      hayvanLimiti: plan.hayvanLimiti,
      subscriptionStatus: 'active'
    });

    res.json({
      success: true,
      message: `${plan.ad} planı aktif edildi! Bitiş tarihi: ${planEndsAt.toLocaleDateString('tr-TR')}`,
      plan: planKey,
      planEndsAt
    });
  } catch (error) {
    console.error('Demo aktivasyon error:', error);
    res.status(500).json({ message: 'Aktivasyon başarısız.' });
  }
});

// İyzico Webhook (ödeme onayı geldiğinde Tenant planı güncelle)
router.post('/webhook/iyzico', async (req, res) => {
  try {
    const webhookSecret = process.env.IYZICO_WEBHOOK_SECRET;
    if (webhookSecret) {
      const gelen = req.headers['x-iyz-signature'] || req.query.token;
      if (gelen !== webhookSecret) {
        console.warn('Webhook: geçersiz imza reddedildi');
        return res.status(401).json({ message: 'Yetkisiz' });
      }
    }

    const payload = req.body;
    console.log('İyzico webhook:', JSON.stringify(payload));

    if (payload.status === 'success' && payload.paymentId) {
      const tenantId = payload.metadata?.tenantId;
      const planKey = payload.metadata?.planKey;
      const plan = PLANLAR[planKey];

      if (tenantId && plan) {
        const planEndsAt = new Date();
        planEndsAt.setMonth(planEndsAt.getMonth() + 1);

        await Tenant.findByIdAndUpdate(tenantId, {
          plan: planKey,
          planEndsAt,
          hayvanLimiti: plan.hayvanLimiti,
          subscriptionStatus: 'active',
          iyzipaySubscriptionId: payload.subscriptionReferenceCode || null
        });
        console.log(`Tenant ${tenantId} → plan: ${planKey} aktif edildi.`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook işlenemedi.' });
  }
});

// Plan listesi (frontend için)
router.get('/planlar', (req, res) => {
  res.json(Object.entries(PLANLAR).map(([key, val]) => ({ key, ...val })));
});

module.exports = router;
