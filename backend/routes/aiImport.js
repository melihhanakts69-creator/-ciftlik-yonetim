/**
 * aiImport.js — Hibrit Akıllı İthalat Route (v2)
 * POST /api/ai-import/analiz  → Dosyayı oku, tüm alanları + autoType dön
 * POST /api/ai-import/kaydet  → Satır bazlı tür ile toplu DB kaydı
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const { parseFile } = require('../utils/fileParser');
const { analyzeWithGemini } = require('../utils/geminiVision');
const mongoose = require('mongoose');

// ─── MULTER ──────────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'image/jpeg', 'image/png', 'image/webp',
    ];
    if (allowed.includes(file.mimetype) || /\.(xlsx|xls|csv|pdf|jpg|jpeg|png|webp)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen dosya türü.'));
    }
  }
});

// ─── ANALİZ ──────────────────────────────────────────────────────────────────
router.post('/analiz', auth, upload.single('dosya'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Dosya yüklenmedi' });

    const { buffer, mimetype, originalname, size } = req.file;

    let result;
    try {
      result = await parseFile(buffer, mimetype, originalname);
    } catch (parseErr) {
      console.warn('[aiImport] Parser hatası:', parseErr.message);
      result = { items: [], needsAi: true, source: 'unknown' };
    }

    // AI Fallback
    if (result.needsAi || result.items.length === 0) {
      const isImage = mimetype.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(originalname);
      const isPdf = mimetype === 'application/pdf' || /\.pdf$/i.test(originalname);

      if (isImage || isPdf) {
        try {
          result = await analyzeWithGemini(buffer.toString('base64'), isPdf ? 'application/pdf' : mimetype);
          // Gemini'den gelen satırlara da autoType ekle
          const { detectAnimalType, calcAgeMonths } = require('../utils/fileParser');
          result.items = (result.items || []).map(item => ({
            ...item,
            ageMonths: calcAgeMonths(item.birth_date),
            autoType: item.hayvan_tipi || detectAnimalType(item),
          }));
        } catch (aiErr) {
          return res.status(422).json({
            message: 'Dosya okunamadı. Lütfen metin tabanlı PDF veya Excel/CSV yükleyin.',
            detail: aiErr.message
          });
        }
      } else {
        return res.status(422).json({ message: 'Bu formatta veri çıkarılamadı.' });
      }
    }

    // Temizle, _tempId ekle
    const items = (result.items || [])
      .filter(i => i.ear_tag?.length >= 3)
      .map((item, idx) => ({
        _tempId: idx,
        ear_tag:      String(item.ear_tag || '').trim().toUpperCase(),
        name:         String(item.name || '').trim(),
        breed:        item.breed || 'Belirsiz',
        gender:       item.gender || '',
        birth_date:   item.birth_date || '',
        weight:       Number(item.weight) || 0,
        anne_kupe_no: String(item.anne_kupe_no || '').trim(),
        baba_kupe_no: String(item.baba_kupe_no || '').trim(),
        dogum_yeri:   String(item.dogum_yeri || '').trim(),
        notlar:       String(item.notlar || '').trim(),
        ageMonths:    item.ageMonths,
        autoType:     item.autoType || 'inek', // Frontend kullanıcıya gösterecek, değiştirebilir
      }));

    // Özet istatistik
    const typeStats = items.reduce((acc, i) => {
      acc[i.autoType] = (acc[i.autoType] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      items,
      count: items.length,
      source: result.source,
      usedAi: result.source === 'gemini',
      dosyaAdi: originalname,
      dosyaBoyutu: Math.round(size / 1024) + ' KB',
      typeStats, // { inek: 10, buzagi: 5, duve: 3 }
    });

  } catch (err) {
    console.error('[aiImport/analiz]', err);
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Dosya 15 MB sınırını aşıyor' });
    res.status(500).json({ message: 'Dosya işlenemedi: ' + err.message });
  }
});

// ─── KAYDET ──────────────────────────────────────────────────────────────────
// Her satırın kendi `hayvanTipi` alanını kullanır (frontend per-row override ile gönderir)
router.post('/kaydet', auth, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = new mongoose.Types.ObjectId(req.userId);

    if (!items?.length) return res.status(400).json({ message: 'Kaydedilecek hayvan listesi boş' });

    const Inek   = require('../models/Inek');
    const Duve   = require('../models/Duve');
    const Buzagi = require('../models/Buzagi');
    const Tosun  = require('../models/Tosun');

    const modelMap = { inek: Inek, duve: Duve, buzagi: Buzagi, tosun: Tosun };

    // Tüm mevcut küpe nolarını bir kerede çek
    const [inekKupeler, duveKupeler, buzagiKupeler, tosunKupeler] = await Promise.all([
      Inek.find({ userId }).select('kupeNo').lean(),
      Duve.find({ userId }).select('kupeNo').lean(),
      Buzagi.find({ userId }).select('kupeNo').lean(),
      Tosun.find({ userId }).select('kupeNo').lean(),
    ]);
    const mevcutSet = new Set([
      ...inekKupeler, ...duveKupeler, ...buzagiKupeler, ...tosunKupeler
    ].map(h => h.kupeNo?.toUpperCase()));

    const kaydedilenler = [];
    const atlananlar = [];

    for (const item of items) {
      const kupeNo = String(item.ear_tag || '').trim().toUpperCase();
      if (!kupeNo) { atlananlar.push({ kupeNo: '—', sebep: 'Küpe no boş' }); continue; }
      if (mevcutSet.has(kupeNo)) { atlananlar.push({ kupeNo, sebep: 'Zaten kayıtlı' }); continue; }

      const tip = (item.hayvanTipi || item.autoType || 'inek').toLowerCase();
      const Model = modelMap[tip] || Inek;

      // Yaş hesapla
      let yas = 0;
      if (item.birth_date) {
        const ms = Date.now() - new Date(item.birth_date).getTime();
        yas = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24 * 30.44)));
      }

      // Notlar birleştir
      const notParts = [];
      if (item.breed && item.breed !== 'Belirsiz') notParts.push(`Irk: ${item.breed}`);
      if (item.dogum_yeri) notParts.push(`Doğum Yeri: ${item.dogum_yeri}`);
      if (item.notlar) notParts.push(item.notlar);
      notParts.push('AI İthalat');

      try {
        const basePayload = {
          userId,
          isim:        item.name || kupeNo,
          kupeNo,
          kilo:        Number(item.weight) || 0,
          dogumTarihi: item.birth_date ? new Date(item.birth_date) : undefined,
          notlar:      notParts.join(' | '),
          anneKupeNo:  item.anne_kupe_no || undefined,
          babaKupeNo:  item.baba_kupe_no || undefined,
        };

        if (tip === 'inek') {
          Object.assign(basePayload, { yas, durum: 'Aktif' });
        } else if (tip === 'duve') {
          Object.assign(basePayload, { yas, gebelikDurumu: 'Belirsiz' });
        } else if (tip === 'buzagi') {
          // Buzağı için cinsiyet zorunlu
          const cinsiyet = item.gender === 'erkek' ? 'erkek' : 'disi';
          Object.assign(basePayload, {
            cinsiyet,
            dogumTarihi: item.birth_date ? new Date(item.birth_date) : new Date(),
          });
          if (!basePayload.kilo) basePayload.kilo = 0;
        } else if (tip === 'tosun') {
          Object.assign(basePayload, { yas, durum: 'Aktif' });
        }

        await new Model(basePayload).save();
        kaydedilenler.push({ kupeNo, tip });
        mevcutSet.add(kupeNo);
      } catch (saveErr) {
        atlananlar.push({ kupeNo, sebep: saveErr.message });
      }
    }

    // Özet
    const tipOzet = kaydedilenler.reduce((acc, k) => {
      acc[k.tip] = (acc[k.tip] || 0) + 1;
      return acc;
    }, {});

    res.json({
      message: `${kaydedilenler.length} hayvan eklendi.${atlananlar.length > 0 ? ` ${atlananlar.length} atlandı.` : ''}`,
      eklenen: kaydedilenler.length,
      atlanan: atlananlar.length,
      tipOzet, // { inek: 10, buzagi: 5 }
      atlanmaDetay: atlananlar,
    });

  } catch (err) {
    console.error('[aiImport/kaydet]', err);
    res.status(500).json({ message: 'Kayıt hatası: ' + err.message });
  }
});

module.exports = router;
