/**
 * aiImport.js — Hibrit Akıllı İthalat Route
 * POST /api/ai-import/analiz  → Dosyayı oku, JSON dön
 * POST /api/ai-import/kaydet  → Onaylı listeyi DB'ye yaz
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const { parseFile } = require('../utils/fileParser');
const { analyzeWithGemini } = require('../utils/geminiVision');
const mongoose = require('mongoose');

// ─── MULTER — Belleğe al, diske yazma ────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv|pdf|jpg|jpeg|png|webp)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen dosya türü. Excel, CSV, PDF veya görsel yükleyin.'));
    }
  }
});

// ─── ANALİZ ───────────────────────────────────────────────────────────────────
router.post('/analiz', auth, upload.single('dosya'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    // 1. Önce kuralsız parser dene
    let result;
    try {
      result = await parseFile(buffer, mimetype, originalname);
    } catch (parseErr) {
      console.warn('[aiImport] Parser hatası:', parseErr.message);
      result = { items: [], needsAi: true, source: 'unknown' };
    }

    // 2. AI Fallback: taranmış PDF veya görsel
    if (result.needsAi || result.items.length === 0) {
      console.log('[aiImport] AI Fallback devreye giriyor:', result.source);

      // Görsel türlerini veya taranmış PDF'i Gemini'ye gönder
      const isImage = mimetype.startsWith('image/') || ['jpg','jpeg','png','webp'].some(e => originalname.toLowerCase().endsWith(e));
      const isPdf = mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf');

      if (isImage || isPdf) {
        const base64 = buffer.toString('base64');
        const aiMime = isPdf ? 'application/pdf' : mimetype;
        try {
          result = await analyzeWithGemini(base64, aiMime);
        } catch (aiErr) {
          console.error('[aiImport] Gemini hatası:', aiErr.message);
          return res.status(422).json({
            message: 'Dosya okunamadı. Lütfen metin tabanlı PDF veya Excel/CSV yükleyin.',
            detail: aiErr.message
          });
        }
      } else {
        return res.status(422).json({
          message: 'Bu formatta veri çıkarılamadı. Excel, CSV veya Türkvet PDF yükleyin.',
        });
      }
    }

    // Temizle ve filtrele
    const items = (result.items || [])
      .filter(item => item.ear_tag && item.ear_tag.length >= 3)
      .map((item, idx) => ({
        _tempId: idx,
        ear_tag: String(item.ear_tag).trim().toUpperCase(),
        breed: item.breed || 'Belirsiz',
        gender: item.gender || '',
        birth_date: item.birth_date || '',
        name: item.name || '',
        weight: Number(item.weight) || 0,
      }));

    return res.json({
      items,
      count: items.length,
      source: result.source,
      usedAi: result.source === 'gemini',
      dosyaAdi: originalname,
      dosyaBoyutu: Math.round(size / 1024) + ' KB',
    });

  } catch (err) {
    console.error('[aiImport/analiz] Hata:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Dosya 15 MB sınırını aşıyor' });
    }
    res.status(500).json({ message: 'Dosya işlenemedi: ' + err.message });
  }
});

// ─── KAYDET ───────────────────────────────────────────────────────────────────
router.post('/kaydet', auth, async (req, res) => {
  try {
    const { items, hayvanTipi = 'inek' } = req.body;
    const userId = new mongoose.Types.ObjectId(req.userId);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Kaydedilecek hayvan listesi boş' });
    }

    // Model seçimi
    let Model;
    if (hayvanTipi === 'duve') {
      Model = require('../models/Duve');
    } else if (hayvanTipi === 'buzagi') {
      Model = require('../models/Buzagi');
    } else {
      Model = require('../models/Inek');
    }

    // Mevcut küpe nolarını çek (çakışma kontrolü)
    const mevcutKupeler = new Set(
      (await Model.find({ userId }).select('kupeNo').lean()).map(h => h.kupeNo?.toUpperCase())
    );

    const kaydedilenler = [];
    const atlananlar = [];

    for (const item of items) {
      const kupeNo = String(item.ear_tag || '').trim().toUpperCase();
      if (!kupeNo) { atlananlar.push({ kupeNo: '—', sebep: 'Küpe no boş' }); continue; }
      if (mevcutKupeler.has(kupeNo)) { atlananlar.push({ kupeNo, sebep: 'Zaten kayıtlı' }); continue; }

      // Yaş hesapla
      let yas = 0;
      if (item.birth_date) {
        const ms = Date.now() - new Date(item.birth_date).getTime();
        yas = Math.floor(ms / (1000 * 60 * 60 * 24 * 30.44));
      }

      try {
        const payload = {
          userId,
          isim: item.name || kupeNo,
          kupeNo,
          yas,
          kilo: Number(item.weight) || 0,
          dogumTarihi: item.birth_date ? new Date(item.birth_date) : undefined,
          notlar: `AI İthalat — Irk: ${item.breed || '-'}, Cinsiyet: ${item.gender || '-'}`,
        };

        // Model-spesifik alanlara bakılmaksızın ekle
        if (hayvanTipi === 'inek') payload.durum = 'Aktif';
        if (hayvanTipi === 'buzagi') payload.cinsiyet = item.gender === 'inek' ? 'disi' : 'erkek';

        const yeni = new Model(payload);
        await yeni.save();
        kaydedilenler.push(kupeNo);
        mevcutKupeler.add(kupeNo);
      } catch (saveErr) {
        atlananlar.push({ kupeNo, sebep: saveErr.message });
      }
    }

    res.json({
      message: `${kaydedilenler.length} hayvan eklendi.${atlananlar.length > 0 ? ` ${atlananlar.length} atlandı.` : ''}`,
      eklenen: kaydedilenler.length,
      atlanan: atlananlar.length,
      atlanmaDetay: atlananlar,
    });

  } catch (err) {
    console.error('[aiImport/kaydet] Hata:', err);
    res.status(500).json({ message: 'Kayıt hatası: ' + err.message });
  }
});

module.exports = router;
