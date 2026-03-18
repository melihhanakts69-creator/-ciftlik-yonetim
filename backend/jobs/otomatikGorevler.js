/**
 * Otomatik Bildirim Görevleri
 * Doğum yaklaşan, gecikmiş, kuruya alma, kızgınlık, sütten kesme bildirimlerini oluşturur.
 * Hem /api/dashboard/yapilacaklar endpoint'i hem de node-cron scheduler tarafından kullanılır.
 */
const mongoose = require('mongoose');
const Inek = require('../models/Inek');
const Duve = require('../models/Duve');
const Buzagi = require('../models/Buzagi');
const Tosun = require('../models/Tosun');
const Bildirim = require('../models/Bildirim');
const Grup = require('../models/Grup');
const Rasyon = require('../models/Rasyon');
const Stok = require('../models/Stok');

async function getGrupBasCount(userId, grupId) {
  const uid = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
  const gid = mongoose.Types.ObjectId.isValid(grupId) ? new mongoose.Types.ObjectId(grupId) : grupId;
  const [inek, duve, buzagi, tosun] = await Promise.all([
    Inek.countDocuments({ userId: uid, grupId: gid, durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] }, aktif: { $ne: false } }),
    Duve.countDocuments({ userId: uid, grupId: gid, aktif: { $ne: false } }),
    Buzagi.countDocuments({ userId: uid, grupId: gid, durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] }, aktif: { $ne: false } }),
    Tosun.countDocuments({ userId: uid, grupId: gid, durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] }, aktif: { $ne: false } })
  ]);
  return inek + duve + buzagi + tosun;
}

async function otomatikGorevleriKontrolEt(userId) {
  try {
    const uid = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const bugun = new Date();
    const yediGunSonra = new Date();
    yediGunSonra.setDate(bugun.getDate() + 7);

    // 1. DOĞUM YAKLAŞIYOR (7 gün içinde) — aktif hayvanlar
    const gebeler = await Promise.all([
      Inek.find({ userId: uid, gebelikDurumu: 'Gebe', durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] }, aktif: { $ne: false } }),
      Duve.find({ userId: uid, gebelikDurumu: 'Gebe', aktif: { $ne: false } })
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

    // 3. KIZGINLIK KONTROLÜ — aktif inekler
    const kizginlikAdaylari = await Inek.find({
      userId: uid,
      durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] },
      aktif: { $ne: false },
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

    // 4. SÜTTEN KESME (75-95 gün arası buzağılar) — aktif buzağılar
    const buzagilar = await Buzagi.find({ userId: uid, durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] }, aktif: { $ne: false } });
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

    // 5. GEBELİK MUAYENESİ (tohumlamadan 35-45 gün) — aktif inekler
    const tohumlananlar = await Inek.find({
      userId: uid,
      gebelikDurumu: 'Belirsiz',
      tohumlamaTarihi: { $exists: true, $ne: null },
      durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] },
      aktif: { $ne: false }
    }).lean();

    for (const inek of tohumlananlar) {
      const gecenGun = Math.floor(
        (bugun - new Date(inek.tohumlamaTarihi)) / (1000 * 60 * 60 * 24)
      );
      if (gecenGun >= 35 && gecenGun <= 45) {
        const varMi = await Bildirim.findOne({
          userId: uid,
          hayvanId: inek._id,
          'metadata.tip': 'gebelik_muayenesi',
          createdAt: { $gte: new Date(bugun - 10 * 86400000) }
        });
        if (!varMi) {
          await Bildirim.create({
            userId: uid,
            tip: 'muayene',
            baslik: `Gebelik Kontrolü: ${inek.isim || inek.kupeNo}`,
            mesaj: `Tohumlamadan ${gecenGun} gün geçti. Gebelik teyidi için veterinere muayene ettirin.`,
            hayvanId: inek._id,
            hayvanTipi: 'inek',
            oncelik: 'yuksek',
            hatirlatmaTarihi: bugun,
            metadata: { tip: 'gebelik_muayenesi', gecenGun }
          });
        }
      }
    }

    // 6. POSTPARTUM KONTROL (doğumdan 12-21 gün) — aktif inekler
    const yeniDogan = await Inek.find({
      userId: uid,
      sonBuzagilamaTarihi: {
        $gte: new Date(bugun - 21 * 86400000),
        $lte: new Date(bugun - 12 * 86400000)
      },
      durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] },
      aktif: { $ne: false }
    }).lean();

    for (const inek of yeniDogan) {
      const varMi = await Bildirim.findOne({
        userId: uid,
        hayvanId: inek._id,
        'metadata.tip': 'postpartum',
        tamamlandi: false
      });
      if (!varMi) {
        const gecenGun = Math.floor(
          (bugun - new Date(inek.sonBuzagilamaTarihi)) / (1000 * 60 * 60 * 24)
        );
        await Bildirim.create({
          userId: uid,
          tip: 'muayene',
          baslik: `Postpartum Kontrol: ${inek.isim || inek.kupeNo}`,
          mesaj: `Doğumdan ${gecenGun} gün geçti. Rahim, meme ve genel durum kontrol edilmeli.`,
          hayvanId: inek._id,
          hayvanTipi: 'inek',
          oncelik: 'yuksek',
          hatirlatmaTarihi: bugun,
          metadata: { tip: 'postpartum', gecenGun }
        });
      }
    }

    // 7. TOHUMLAMA ZAMANI (doğumdan 60+ gün, hâlâ gebe değil) — aktif inekler
    const tohumlanacaklar = await Inek.find({
      userId: uid,
      gebelikDurumu: 'Gebe Değil',
      sonBuzagilamaTarihi: {
        $lte: new Date(bugun - 60 * 86400000)
      },
      durum: { $nin: ['Silindi', 'Satıldı', 'Öldü'] },
      aktif: { $ne: false }
    }).lean();

    for (const inek of tohumlanacaklar) {
      const varMi = await Bildirim.findOne({
        userId: uid,
        hayvanId: inek._id,
        'metadata.tip': 'tohumlama_zamani',
        createdAt: { $gte: new Date(bugun - 21 * 86400000) }
      });
      if (!varMi) {
        const gecenGun = Math.floor(
          (bugun - new Date(inek.sonBuzagilamaTarihi)) / (1000 * 60 * 60 * 24)
        );
        await Bildirim.create({
          userId: uid,
          tip: 'kizginlik',
          baslik: `Tohumlama Zamanı: ${inek.isim || inek.kupeNo}`,
          mesaj: `Doğumdan ${gecenGun} gün geçti, henüz tohumlanmadı. Kızgınlık takibine başlayın.`,
          hayvanId: inek._id,
          hayvanTipi: 'inek',
          oncelik: 'normal',
          hatirlatmaTarihi: bugun,
          metadata: { tip: 'tohumlama_zamani', gecenGun }
        });
      }
    }

    // ── RASYON UYUMSUZLUK KONTROLÜ ──────────────────────────────
    const gruplar = await Grup.find({ userId: uid, aktif: true })
      .populate('rasyonId')
      .lean();

    for (const grup of gruplar) {
      const basCount = await getGrupBasCount(userId, grup._id);
      if (basCount === 0) continue;

      if (!grup.rasyonId) {
        const varMi = await Bildirim.findOne({
          userId: uid,
          'metadata.tip': 'rasyon_eksik',
          'metadata.grupId': grup._id.toString(),
          tamamlandi: false,
          createdAt: { $gte: new Date(Date.now() - 7 * 86400000) }
        });
        if (!varMi) {
          await Bildirim.create({
            userId: uid,
            tip: 'yem',
            oncelik: 'normal',
            baslik: `Rasyon Eksik: ${grup.ad}`,
            mesaj: `${grup.ad} grubunda ${basCount} hayvan var ama rasyon atanmamış. Yem Merkezi > Gruplar'dan rasyon atayın.`,
            hatirlatmaTarihi: bugun,
            metadata: { tip: 'rasyon_eksik', grupId: grup._id.toString() }
          });
        }
        continue;
      }

      const rasyon = grup.rasyonId;

      for (const kalem of (rasyon.icerik || [])) {
        const yemAdi = kalem.yemAdi || (kalem.yemId && typeof kalem.yemId === 'object' ? kalem.yemId.ad : null);
        if (!yemAdi) continue;

        const stok = await Stok.findOne({
          userId: uid,
          kategori: 'Yem',
          urunAdi: { $regex: new RegExp(yemAdi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
        });

        if (!stok || (stok.miktar || 0) <= 0) {
          const varMi = await Bildirim.findOne({
            userId: uid,
            'metadata.tip': 'rasyon_stok_yok',
            'metadata.yemAdi': yemAdi,
            tamamlandi: false,
            createdAt: { $gte: new Date(Date.now() - 3 * 86400000) }
          });
          if (!varMi) {
            await Bildirim.create({
              userId: uid,
              tip: 'stok',
              oncelik: 'acil',
              baslik: `Rasyon Uygulanamıyor: ${grup.ad}`,
              mesaj: `${grup.ad} rasyonundaki "${yemAdi}" stokta yok veya tükendi. Yemleme yapılamıyor.`,
              hatirlatmaTarihi: bugun,
              metadata: { tip: 'rasyon_stok_yok', grupId: grup._id.toString(), yemAdi }
            });
          }
        }
      }

      if (grup.tip === 'sagmal' || grup.tip === 'inek') {
        const transitInek = await Inek.findOne({
          userId: uid,
          grupId: grup._id,
          gebelikDurumu: 'Gebe',
          tohumlamaTarihi: { $lte: new Date(Date.now() - 223 * 86400000) }
        });
        if (transitInek) {
          const varMi = await Bildirim.findOne({
            userId: uid,
            'metadata.tip': 'gecis_donemi',
            hayvanId: transitInek._id,
            tamamlandi: false
          });
          if (!varMi) {
            await Bildirim.create({
              userId: uid,
              tip: 'yem',
              oncelik: 'yuksek',
              baslik: `Geçiş Dönemi: ${transitInek.isim || transitInek.kupeNo}`,
              mesaj: `Doğuma 60 günden az kaldı. Bu hayvan için geçiş (transition) rasyonuna geçmeyi düşünün.`,
              hayvanId: transitInek._id,
              hayvanTipi: 'inek',
              hatirlatmaTarihi: bugun,
              metadata: { tip: 'gecis_donemi' }
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Otomatik görev hatası (userId:', userId, '):', err);
    throw err;
  }
}

module.exports = { otomatikGorevleriKontrolEt };
