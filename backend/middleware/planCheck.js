const Tenant = require('../models/Tenant');
const User = require('../models/User');

/**
 * Plan kontrolü middleware
 * - Trial süresi dolmuşsa ve ücretli plan yoksa POST/PUT/DELETE engellenir
 * - GET isteklerine izin verilir (okuma hep çalışsın)
 * - hayvanLimiti aşılırsa yeni hayvan ekleme engellenir
 */
const planCheck = async (req, res, next) => {
  try {
    const userId = req.originalUserId || req.userId;
    if (!userId) return next();

    const user = await User.findById(userId).select('tenantId rol').lean();
    if (!user?.tenantId) return next(); // Tenant yoksa geç (eski hesaplar)

    const tenant = await Tenant.findById(user.tenantId).select('plan planEndsAt trialEndsAt subscriptionStatus hayvanLimiti').lean();
    if (!tenant) return next();

    const simdi = new Date();
    const plan = tenant.plan || 'trial';
    const trialBitti = tenant.trialEndsAt ? simdi > new Date(tenant.trialEndsAt) : false;
    const planBitti = tenant.planEndsAt ? simdi > new Date(tenant.planEndsAt) : false;

    // Aktif mi?
    const aktif =
      plan === 'trial' ? !trialBitti :
      ['pro', 'vet_pro', 'isletme'].includes(plan) ? !planBitti :
      false; // 'free' — kısıtlı

    // GET isteklerine her zaman izin ver
    if (req.method === 'GET') return next();

    // Trial/plan bitmişse yazma işlemleri engelle
    if (!aktif) {
      return res.status(403).json({
        message: 'Abonelik süresi dolmuş. Devam etmek için bir plan seçin.',
        code: 'SUBSCRIPTION_REQUIRED',
        abonelikUrl: '/abonelik'
      });
    }

    // Hayvan limiti kontrolü (sadece POST isteklerinde)
    if (req.method === 'POST' && tenant.hayvanLimiti) {
      const Inek = require('../models/Inek');
      const Duve = require('../models/Duve');
      const Buzagi = require('../models/Buzagi');
      const Tosun = require('../models/Tosun');
      const mongoose = require('mongoose');

      const uid = new mongoose.Types.ObjectId(req.userId);
      const [inekSayisi, duveSayisi, buzagiSayisi, tosunSayisi] = await Promise.all([
        Inek.countDocuments({ userId: uid }),
        Duve.countDocuments({ userId: uid }),
        Buzagi.countDocuments({ userId: uid }),
        Tosun.countDocuments({ userId: uid }),
      ]);
      const toplam = inekSayisi + duveSayisi + buzagiSayisi + tosunSayisi;

      if (toplam >= tenant.hayvanLimiti) {
        return res.status(403).json({
          message: `Ücretsiz planda en fazla ${tenant.hayvanLimiti} hayvan ekleyebilirsiniz. Pro plana geçerek sınırsız hayvan ekleyin.`,
          code: 'HAYVAN_LIMIT_EXCEEDED',
          limit: tenant.hayvanLimiti,
          mevcut: toplam,
          abonelikUrl: '/abonelik'
        });
      }
    }

    // Plan bilgisini request'e ekle (route'larda kullanılabilsin)
    req.tenantPlan = { plan, aktif, hayvanLimiti: tenant.hayvanLimiti };
    next();
  } catch (error) {
    console.error('planCheck middleware error:', error);
    next(); // Hata durumunda engelleme — kullanıcıya şeffaf çalışsın
  }
};

module.exports = planCheck;
