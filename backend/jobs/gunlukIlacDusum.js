/**
 * Günlük İlaç Stok Düşümü
 * durum: 'devam_ediyor' olan SaglikKaydi kayıtlarında gunlukMiktar > 0 olan ilaçlar için
 * her gün stoktan düşüm yapar. Kullanıcı "İyileşti" butonuna basana kadar devam eder.
 */
const mongoose = require('mongoose');
const SaglikKaydi = require('../models/SaglikKaydi');
const Stok = require('../models/Stok');
const Bildirim = require('../models/Bildirim');

const ILAC_KATEGORILER = ['İlaç', 'Antibiyotik', 'Vitamin', 'Anti-inflamatuar', 'Paraziter'];

async function gunlukIlacDusumunuUygula(userId) {
  const uid = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const bugunStr = bugun.toISOString().slice(0, 10);

  const kayitlar = await SaglikKaydi.find({
    userId: uid,
    durum: 'devam_ediyor',
    'ilaclar.0': { $exists: true }
  }).lean();

  let dusumSayisi = 0;

  for (const kayit of kayitlar) {
    if (!kayit.ilaclar || kayit.ilaclar.length === 0) continue;

    const ilaclarGuncel = [...kayit.ilaclar];
    let degisti = false;

    for (let i = 0; i < ilaclarGuncel.length; i++) {
      const ilac = ilaclarGuncel[i];
      const gunlukMiktar = Number(ilac.gunlukMiktar) || 0;
      if (gunlukMiktar <= 0) continue;
      if (!ilac.ilacAdi || !String(ilac.ilacAdi).trim()) continue;

      const sonDusum = ilac.sonDusumTarihi ? new Date(ilac.sonDusumTarihi) : null;
      const sonDusumStr = sonDusum ? sonDusum.toISOString().slice(0, 10) : null;

      if (sonDusumStr === bugunStr) continue;

      const stok = await Stok.findOne({
        userId: uid,
        urunAdi: { $regex: new RegExp((ilac.ilacAdi || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        kategori: { $in: ILAC_KATEGORILER }
      });

      if (!stok) continue;

      const birim = ilac.gunlukBirim || ilac.birim || 'ml';
      const dusulecek = gunlukMiktar;
      const yeniMiktar = Math.max(0, (stok.miktar || 0) - dusulecek);

      stok.miktar = yeniMiktar;
      stok.sonGuncelleme = new Date();
      await stok.save();

      ilaclarGuncel[i] = { ...ilac, sonDusumTarihi: bugun };
      degisti = true;
      dusumSayisi++;

      if (yeniMiktar <= (stok.kritikSeviye || 0)) {
        const mevcutBildirim = await Bildirim.findOne({
          userId: uid,
          tip: 'stok',
          tamamlandi: false,
          'metadata.stokId': stok._id.toString()
        });
        if (!mevcutBildirim) {
          await Bildirim.create({
            userId: uid,
            tip: 'stok',
            oncelik: 'acil',
            baslik: `İlaç Stok Uyarısı: ${stok.urunAdi}`,
            mesaj: `${stok.urunAdi} kritik seviyede. Mevcut: ${yeniMiktar} ${stok.birim}.`,
            hatirlatmaTarihi: new Date(),
            metadata: { stokId: stok._id.toString(), urunAdi: stok.urunAdi }
          });
        }
      }
    }

    if (degisti) {
      await SaglikKaydi.updateOne(
        { _id: kayit._id },
        { $set: { ilaclar: ilaclarGuncel } }
      );
    }
  }

  return dusumSayisi;
}

async function tumCiftcilerIcinGunlukIlacDusum() {
  if (mongoose.connection.readyState !== 1) {
    console.log('[GunlukIlacDusum] DB bağlı değil, atlanıyor');
    return;
  }

  try {
    const User = require('../models/User');
    const users = await User.find({ rol: 'ciftci', aktif: true }).select('_id').lean();
    console.log(`[GunlukIlacDusum] Başlatıldı — ${users.length} çiftçi`);

    let toplamDusum = 0;
    for (const u of users) {
      try {
        const n = await gunlukIlacDusumunuUygula(u._id);
        toplamDusum += n;
      } catch (e) {
        console.error('[GunlukIlacDusum] Hata (userId:', u._id, '):', e.message);
      }
    }

    console.log(`[GunlukIlacDusum] Tamamlandı — ${toplamDusum} düşüm`);
  } catch (err) {
    console.error('[GunlukIlacDusum] Genel hata:', err);
  }
}

module.exports = { gunlukIlacDusumunuUygula, tumCiftcilerIcinGunlukIlacDusum };
