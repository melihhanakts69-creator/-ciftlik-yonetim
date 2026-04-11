/**
 * aiImport.js — Hibrit Akıllı İthalat Route (v3 — hata düzeltmeleri)
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

// ─── MULTER — Daha geniş kabul listesi (Windows/Mac mimetype farkları) ────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (req, file, cb) => {
    const name = (file.originalname || '').toLowerCase();
    const isAllowedExt = /\.(xlsx|xls|csv|pdf|jpg|jpeg|png|webp)$/.test(name);
    // Mimetype kontrolünü sadece yedek olarak kullan; extension öncelikli
    if (isAllowedExt) return cb(null, true);

    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/msexcel',
      'application/x-msexcel',
      'application/excel',
      'text/csv',
      'text/plain', // bazı CSV dosyaları text/plain gelir
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    ];
    if (allowedMimes.includes(file.mimetype)) return cb(null, true);

    cb(new Error(`Desteklenmeyen dosya türü. Lütfen Excel, CSV, PDF veya görsel yükleyin. (${file.mimetype})`));
  }
});

// ─── ANALİZ ──────────────────────────────────────────────────────────────────
router.post('/analiz', auth, upload.single('dosya'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Dosya yüklenmedi' });

    const { buffer, mimetype, originalname, size } = req.file;
    const ext = originalname.split('.').pop().toLowerCase();

    console.log(`[aiImport] Dosya: ${originalname}, Tip: ${mimetype}, Boyut: ${Math.round(size/1024)}KB`);

    let result;
    let parseError = null;

    // 1. Kuralsız parser dene
    try {
      result = await parseFile(buffer, mimetype, originalname);
      console.log(`[aiImport] Parser sonucu: source=${result.source}, items=${result.items?.length}, needsAi=${result.needsAi}`);
    } catch (err) {
      parseError = err;
      console.warn('[aiImport] Parser hatası:', err.message);
      result = { items: [], needsAi: true, source: 'unknown' };
    }

    // 2. AI Fallback — görsel ve taranmış PDF
    if (result.needsAi || result.items.length === 0) {
      const isImage = /\.(jpg|jpeg|png|webp)$/i.test(originalname) || (mimetype || '').startsWith('image/');
      const isPdf = ext === 'pdf' || mimetype === 'application/pdf';

      if (isImage || isPdf) {
        console.log(`[aiImport] Gemini'ye gönderiliyor... (${isImage ? 'görsel' : 'pdf'})`);
        try {
          const base64 = buffer.toString('base64');
          const aiMime = isPdf ? 'application/pdf' : (mimetype || 'image/jpeg');
          result = await analyzeWithGemini(base64, aiMime);

          // Gemini sonucuna autoType ekle
          const { detectAnimalType, calcAgeMonths } = require('../utils/fileParser');
          result.items = (result.items || []).map(item => ({
            ...item,
            ageMonths: calcAgeMonths(item.birth_date),
            autoType: item.hayvan_tipi || detectAnimalType(item),
          }));

          console.log(`[aiImport] Gemini sonucu: ${result.items?.length} hayvan`);
        } catch (aiErr) {
          console.error('[aiImport] Gemini hatası:', aiErr.message);
          const hint = parseError ? `Dosyadan okuma başarısız: ${parseError.message}. ` : '';
          return res.status(422).json({
            message: `${hint}Yapay zeka da dosyayı işleyemedi. Lütfen metin tabanlı PDF veya Excel/CSV yükleyin.`,
            detail: aiErr.message
          });
        }
      } else {
        // Excel/CSV ama hiç item gelemediyse detaylı hata ver
        const hint = parseError
          ? `Hata: ${parseError.message}. Dosya boş veya kolonlar tanımlanamadı.`
          : `0 hayvan bulundu. Lütfen dosyada "Küpe No" kolonu olduğundan emin olun.`;
        return res.status(422).json({ message: hint });
      }
    }

    // Temizle ve normalize et
    const items = (result.items || [])
      .filter(i => String(i.ear_tag || '').trim().length >= 2)
      .map((item, idx) => ({
        _tempId: idx,
        ear_tag:      String(item.ear_tag || '').replace(/\s/g, '').trim().toUpperCase(),
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
        autoType:     item.autoType || 'inek',
      }));

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
      typeStats,
    });

  } catch (err) {
    console.error('[aiImport/analiz] Beklenmeyen hata:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Dosya 15 MB sınırını aşıyor' });
    }
    res.status(500).json({ message: 'Sunucu hatası: ' + err.message });
  }
});

// ─── KAYDET ──────────────────────────────────────────────────────────────────
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

    // Mevcut küpe nolarını çek (çakışma kontrolü)
    const [inekKupeler, duveKupeler, buzagiKupeler, tosunKupeler] = await Promise.all([
      Inek.find({ userId }).select('kupeNo').lean(),
      Duve.find({ userId }).select('kupeNo').lean(),
      Buzagi.find({ userId }).select('kupeNo').lean(),
      Tosun.find({ userId }).select('kupeNo').lean(),
    ]);
    const mevcutSet = new Set([
      ...inekKupeler, ...duveKupeler, ...buzagiKupeler, ...tosunKupeler
    ].map(h => h.kupeNo?.toUpperCase()).filter(Boolean));

    const kaydedilenler = [];
    const atlananlar = [];

    for (const item of items) {
      const kupeNo = String(item.ear_tag || '').replace(/\s/g, '').trim().toUpperCase();
      if (!kupeNo) { atlananlar.push({ kupeNo: '—', sebep: 'Küpe no boş' }); continue; }
      if (mevcutSet.has(kupeNo)) { atlananlar.push({ kupeNo, sebep: 'Zaten kayıtlı' }); continue; }

      const tip = String(item.hayvanTipi || item.autoType || 'inek').toLowerCase();
      const Model = modelMap[tip] || Inek;

      // Yaş hesapla
      let yas = 0;
      if (item.birth_date) {
        const ms = Date.now() - new Date(item.birth_date).getTime();
        yas = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24 * 30.44)));
      }

      // Notlar
      const notParts = [];
      if (item.breed && item.breed !== 'Belirsiz') notParts.push(`Irk: ${item.breed}`);
      if (item.dogum_yeri) notParts.push(`Doğum Yeri: ${item.dogum_yeri}`);
      if (item.notlar) notParts.push(item.notlar);
      notParts.push('Akıllı İthalat');

      try {
        const basePayload = {
          userId,
          isim:        item.name || kupeNo,
          kupeNo,
          kilo:        Number(item.weight) || 0,
          notlar:      notParts.join(' | '),
          anneKupeNo:  item.anne_kupe_no || undefined,
          babaKupeNo:  item.baba_kupe_no || undefined,
        };

        // Doğum tarihi varsa ekle
        if (item.birth_date) {
          const dDate = new Date(item.birth_date);
          if (!isNaN(dDate)) basePayload.dogumTarihi = dDate;
        }

        if (tip === 'inek') {
          basePayload.yas    = yas;
          basePayload.durum  = 'Aktif';
        } else if (tip === 'duve') {
          basePayload.yas           = yas;
          basePayload.gebelikDurumu = 'Belirsiz';
        } else if (tip === 'buzagi') {
          // Buzağı: dogumTarihi required — güvenli fallback
          if (!basePayload.dogumTarihi) basePayload.dogumTarihi = new Date();
          basePayload.cinsiyet = item.gender === 'erkek' ? 'erkek' : 'disi';
        } else if (tip === 'tosun') {
          basePayload.yas   = yas;
          basePayload.durum = 'Aktif';
          // Tosun: notlar → not alanına da yaz
          basePayload.not = basePayload.notlar;
          delete basePayload.notlar;
        }

        await new Model(basePayload).save();
        kaydedilenler.push({ kupeNo, tip });
        mevcutSet.add(kupeNo);
      } catch (saveErr) {
        console.error(`[aiImport/kaydet] ${kupeNo} kayıt hatası:`, saveErr.message);
        atlananlar.push({ kupeNo, sebep: saveErr.message.split(': ').pop().slice(0, 80) });
      }
    }

    const tipOzet = kaydedilenler.reduce((acc, k) => {
      acc[k.tip] = (acc[k.tip] || 0) + 1;
      return acc;
    }, {});

    res.json({
      message: `${kaydedilenler.length} hayvan eklendi.${atlananlar.length > 0 ? ` ${atlananlar.length} atlandı.` : ''}`,
      eklenen: kaydedilenler.length,
      atlanan: atlananlar.length,
      tipOzet,
      atlanmaDetay: atlananlar,
    });

  } catch (err) {
    console.error('[aiImport/kaydet]', err);
    res.status(500).json({ message: 'Kayıt hatası: ' + err.message });
  }
});

module.exports = router;
