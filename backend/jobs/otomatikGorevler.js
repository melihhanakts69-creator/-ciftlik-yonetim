/**
 * Otomatik Bildirim Görevleri
 * Doğum yaklaşan, gecikmiş, kuruya alma, kızgınlık, sütten kesme bildirimlerini oluşturur.
 * Hem /api/dashboard/yapilacaklar endpoint'i hem de node-cron scheduler tarafından kullanılır.
 */
const mongoose = require('mongoose');
const Inek = require('../models/Inek');
const Duve = require('../models/Duve');
const Buzagi = require('../models/Buzagi');
const Bildirim = require('../models/Bildirim');

async function otomatikGorevleriKontrolEt(userId) {
  try {
    const uid = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const bugun = new Date();
    const yediGunSonra = new Date();
    yediGunSonra.setDate(bugun.getDate() + 7);

    // 1. DOĞUM YAKLAŞIYOR (7 gün içinde)
    const gebeler = await Promise.all([
      Inek.find({ userId: uid, gebelikDurumu: 'Gebe' }),
      Duve.find({ userId: uid, gebelikDurumu: 'Gebe' })
    ]);
    const tumGebeler = [...gebeler[0], ...gebeler[1]];

    for (const hayvan of tumGebeler) {
      if (!hayvan.tohumlamaTarihi) continue;
      const tohumlama = new Date(hayvan.tohumlamaTarihi);
      const dogum = new Date(tohumlama);
      dogum.setDate(dogum.getDate() + 283);

      if (dogum >= bugun && dogum <= yediGunSonra) {
        const varMi = await Bildirim.findOne({
          userId: uid,
          tip: 'dogum_beklenen',
          hayvanId: hayvan._id,
          createdAt: { $gte: tohumlama }
        });
        if (!varMi) {
          const kalanGun = Math.ceil((dogum - bugun) / (1000 * 60 * 60 * 24));
          await Bildirim.create({
            userId: uid,
            tip: 'dogum_beklenen',
            baslik: `Doğum Yaklaşıyor: ${hayvan.isim || hayvan.kupeNo}`,
            mesaj: `Tahmini doğuma ${kalanGun} gün kaldı. Doğum hazırlıklarını tamamlayın.`,
            hayvanId: hayvan._id,
            hayvanTipi: hayvan instanceof Inek ? 'inek' : 'duve',
            kupe_no: hayvan.kupeNo,
            oncelik: 'yuksek',
            hatirlatmaTarihi: bugun,
            metadata: { tahminiDogum: dogum, kalanGun }
          });
        }
      }
    }

    // 1b. DOĞUM GECİKMİŞ (15+ gün geçti)
    const GECIKME_GUN = 15;
    for (const hayvan of tumGebeler) {
      if (!hayvan.tohumlamaTarihi) continue;
      const tohumlama = new Date(hayvan.tohumlamaTarihi);
      const dogum = new Date(tohumlama);
      dogum.setDate(dogum.getDate() + 283);
      const bugunBaslangic = new Date(bugun);
      bugunBaslangic.setHours(0, 0, 0, 0);
      const dogumGecenGun = Math.floor((bugunBaslangic - dogum) / (1000 * 60 * 60 * 24));
      if (dogumGecenGun >= GECIKME_GUN) {
        const varMi = await Bildirim.findOne({
          userId: uid,
          tip: 'dogum_gecikme',
          hayvanId: hayvan._id,
          tamamlandi: false,
          aktif: true
        });
        if (!varMi) {
          await Bildirim.create({
            userId: uid,
            tip: 'dogum_gecikme',
            baslik: `⏰ Gecikme: ${hayvan.isim || hayvan.kupeNo}`,
            mesaj: `Tahmini doğum tarihi ${dogumGecenGun} gün geçti. Doğum gerçekleştiyse Yaklaşan Doğumlar panelinden kayıt yapın.`,
            hayvanId: hayvan._id,
            hayvanTipi: hayvan.constructor?.modelName === 'Inek' ? 'inek' : 'duve',
            kupe_no: hayvan.kupeNo,
            oncelik: 'acil',
            hatirlatmaTarihi: bugun,
            metadata: { gecenGun: dogumGecenGun, tahminiDogum: dogum }
          });
        }
      }
    }

    // 2. KURUYA ALMA ZAMANI (doğuma 60 gün kala)
    for (const hayvan of tumGebeler) {
      if (!hayvan.tohumlamaTarihi) continue;
      const tohumlama = new Date(hayvan.tohumlamaTarihi);
      const kuruTarihi = new Date(tohumlama);
      kuruTarihi.setDate(kuruTarihi.getDate() + 223);

      if (kuruTarihi >= bugun && kuruTarihi <= yediGunSonra) {
        const varMi = await Bildirim.findOne({
          userId: uid,
          tip: { $in: ['kuruya_alma', 'kuru_donem'] },
          hayvanId: hayvan._id,
          createdAt: { $gte: tohumlama }
        });
        if (!varMi) {
          const kalanGun = Math.ceil((kuruTarihi - bugun) / (1000 * 60 * 60 * 24));
          await Bildirim.create({
            userId: uid,
            tip: 'kuruya_alma',
            baslik: `Kuruya Ayırma: ${hayvan.isim || hayvan.kupeNo}`,
            mesaj: `Doğuma 60 gün kaldı. ${kalanGun > 0 ? `${kalanGun} gün içinde` : 'Bu hafta'} hayvanı kuruya ayırın.`,
            hayvanId: hayvan._id,
            hayvanTipi: hayvan instanceof Inek ? 'inek' : 'duve',
            kupe_no: hayvan.kupeNo,
            oncelik: 'yuksek',
            hatirlatmaTarihi: bugun,
            metadata: { kuruTarihi, kalanGun }
          });
        }
      }
    }

    // 3. KIZGINLIK KONTROLÜ
    const kizginlikAdaylari = await Inek.find({
      userId: uid,
      durum: 'Aktif',
      gebelikDurumu: { $in: ['Gebe Değil', 'Belirsiz'] }
    });

    for (const inek of kizginlikAdaylari) {
      // Önce buzağılama, yoksa tohumlama (sadece gebe değilse — başarısız tohumlama referans)
      const referansTarih = inek.sonBuzagilamaTarihi ||
        (inek.gebelikDurumu !== 'Gebe' ? inek.tohumlamaTarihi : null);
      if (!referansTarih) continue;

      const ref = new Date(referansTarih);
      const gecenGun = Math.floor((bugun - ref) / (1000 * 60 * 60 * 24));
      const kalanGunDongu = 21 - (gecenGun % 21);

      if (kalanGunDongu <= 3) {
        const sonrakiKizginlik = new Date(bugun);
        sonrakiKizginlik.setDate(bugun.getDate() + kalanGunDongu);

        const varMi = await Bildirim.findOne({
          userId: uid,
          tip: 'kizginlik',
          hayvanId: inek._id,
          hatirlatmaTarihi: { $gte: new Date(bugun.getTime() - 3 * 24 * 60 * 60 * 1000) }
        });
        if (!varMi) {
          await Bildirim.create({
            userId: uid,
            tip: 'kizginlik',
            baslik: `Kızgınlık Dönemi: ${inek.isim || inek.kupeNo}`,
            mesaj: `${inek.isim || inek.kupeNo} ${kalanGunDongu <= 0 ? 'bugün' : `${kalanGunDongu} gün içinde`} kızgınlık dönemine girecek. Tohumlama planı yapın.`,
            hayvanId: inek._id,
            hayvanTipi: 'inek',
            kupe_no: inek.kupeNo,
            oncelik: kalanGunDongu <= 1 ? 'acil' : 'yuksek',
            hatirlatmaTarihi: sonrakiKizginlik,
            metadata: { kalanGun: kalanGunDongu, sonrakiKizginlik }
          });
        }
      }
    }

    // 4. SÜTTEN KESME (75-95 gün arası buzağılar)
    const buzagilar = await Buzagi.find({ userId: uid });
    for (const buzagi of buzagilar) {
      if (!buzagi.dogumTarihi) continue;
      const dogum = new Date(buzagi.dogumTarihi);
      const gunFarki = Math.floor((bugun - dogum) / (1000 * 60 * 60 * 24));

      if (gunFarki >= 75 && gunFarki <= 95) {
        const varMi = await Bildirim.findOne({
          userId: uid,
          hayvanId: buzagi._id,
          tip: 'sutten_kesme'
        });
        if (!varMi) {
          await Bildirim.create({
            userId: uid,
            tip: 'sutten_kesme',
            baslik: `Sütten Kesme: ${buzagi.kupeNo}`,
            mesaj: `Buzağı ${Math.floor(gunFarki / 30)} aylık oldu. Sütten kesmeyi planlayın.`,
            hayvanId: buzagi._id,
            hayvanTipi: 'buzagi',
            kupe_no: buzagi.kupeNo,
            oncelik: 'normal',
            hatirlatmaTarihi: bugun
          });
        }
      }
    }
  } catch (err) {
    console.error('Otomatik görev hatası (userId:', userId, '):', err);
    throw err;
  }
}

module.exports = { otomatikGorevleriKontrolEt };
