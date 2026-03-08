const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const DanismaMesaji = require('../models/DanismaMesaji');
const Bildirim = require('../models/Bildirim');
const User = require('../models/User');
const mongoose = require('mongoose');

router.use(auth);
router.use(checkRole(['ciftci', 'veteriner']));

// Mesaj gönder
router.post('/', async (req, res) => {
  try {
    const { aliciId, mesaj } = req.body;
    const gonderenId = req.userId || req.originalUserId;
    if (!aliciId || !mesaj || typeof mesaj !== 'string' || !mesaj.trim()) {
      return res.status(400).json({ message: 'Alıcı ve mesaj gerekli.' });
    }
    if (!mongoose.Types.ObjectId.isValid(aliciId)) {
      return res.status(400).json({ message: 'Geçersiz alıcı.' });
    }
    const alici = await User.findById(aliciId).select('rol musteriler');
    if (!alici) return res.status(404).json({ message: 'Alıcı bulunamadı.' });
    const gonderen = await User.findById(gonderenId).select('rol musteriler isim isletmeAdi');
    if (!gonderen) return res.status(401).json({ message: 'Oturum geçersiz.' });

    if (gonderen.rol === 'ciftci' && alici.rol === 'veteriner') {
      // Çiftçi veterinere yazıyor: veterinerin musteriler listesinde çiftçinin _id'si veya parentUserId'si olmalı
      const musteriler = (alici.musteriler || []).map(m => m.toString());
      const gonderenOriginal = req.originalUserId ? req.originalUserId.toString() : gonderenId;
      if (!musteriler.includes(gonderenId) && !musteriler.includes(gonderenOriginal)) {
        return res.status(403).json({ message: 'Bu veteriner sizi müşteri listesinde yok.' });
      }
    } else if (gonderen.rol === 'veteriner' && alici.rol === 'ciftci') {
      // Veteriner çiftçiye yazıyor: veterinerin musteriler listesinde alıcı çiftçi olmalı
      const musteriler = (gonderen.musteriler || []).map(m => m && m.toString());
      const ciftciId = aliciId.toString();
      if (!musteriler.includes(ciftciId)) {
        return res.status(403).json({ message: 'Bu çiftlik müşteri listenizde yok.' });
      }
    } else {
      return res.status(403).json({ message: 'Sadece çiftçi–veteriner danışması yapılabilir.' });
    }

    const doc = await DanismaMesaji.create({
      gonderenId: new mongoose.Types.ObjectId(gonderenId),
      aliciId: new mongoose.Types.ObjectId(aliciId),
      mesaj: mesaj.trim(),
    });
    const gonderenAd = (gonderen.isletmeAdi || gonderen.isim || 'Biri').toString();
    const mesajKisa = mesaj.trim().length > 120 ? mesaj.trim().slice(0, 117) + '...' : mesaj.trim();
    await Bildirim.create({
      userId: new mongoose.Types.ObjectId(aliciId),
      tip: 'danisma',
      baslik: `${gonderenAd} size danışma mesajı gönderdi`,
      mesaj: mesajKisa,
      oncelik: 'normal',
      metadata: { danismaMesajiId: doc._id, gonderenId },
    });
    const populated = await DanismaMesaji.findById(doc._id)
      .populate('gonderenId', 'isim isletmeAdi')
      .populate('aliciId', 'isim isletmeAdi klinikAdi')
      .lean();
    res.status(201).json(populated);
  } catch (error) {
    console.error('Danisma send error:', error);
    res.status(500).json({ message: 'Mesaj gönderilemedi.' });
  }
});

// Konuşma listesi (karşı taraf kullanıcı + son mesaj önizlemesi)
router.get('/', async (req, res) => {
  try {
    const userId = (req.userId || req.originalUserId).toString();
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const messages = await DanismaMesaji.find({
      $or: [{ gonderenId: userIdObj }, { aliciId: userIdObj }],
    })
      .sort({ createdAt: -1 })
      .lean();
    const otherToLast = {};
    messages.forEach(m => {
      const other = m.gonderenId.toString() === userId ? m.aliciId.toString() : m.gonderenId.toString();
      const createdAt = m.createdAt ? new Date(m.createdAt).getTime() : 0;
      if (!otherToLast[other] || otherToLast[other].createdAt < createdAt) {
        otherToLast[other] = { mesaj: m.mesaj, createdAt };
      }
    });
    const otherIds = Object.keys(otherToLast);
    const others = await User.find({ _id: { $in: otherIds.map(id => new mongoose.Types.ObjectId(id)) } })
      .select('_id isim isletmeAdi klinikAdi')
      .lean();
    const otherMap = {};
    others.forEach(o => { otherMap[o._id.toString()] = o; });
    const threads = otherIds.map(oid => {
      const last = otherToLast[oid];
      const unread = messages.filter(m =>
        m.aliciId.toString() === userId && m.gonderenId.toString() === oid && !m.okundu
      ).length;
      return {
        otherUser: otherMap[oid] || { _id: oid, isim: '—' },
        lastMessage: last?.mesaj,
        lastAt: last?.createdAt,
        unreadCount: unread,
      };
    });
    threads.sort((a, b) => (new Date(b.lastAt) || 0) - (new Date(a.lastAt) || 0));
    res.json(threads);
  } catch (error) {
    console.error('Danisma list error:', error);
    res.status(500).json({ message: 'Liste alınamadı.' });
  }
});

// Belirli kullanıcı ile mesajları getir
router.get('/:otherUserId', async (req, res) => {
  try {
    const userId = (req.userId || req.originalUserId).toString();
    const otherId = req.params.otherUserId;
    if (!mongoose.Types.ObjectId.isValid(otherId)) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı.' });
    }
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const otherIdObj = new mongoose.Types.ObjectId(otherId);
    const list = await DanismaMesaji.find({
      $or: [
        { gonderenId: userIdObj, aliciId: otherIdObj },
        { gonderenId: otherIdObj, aliciId: userIdObj },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('gonderenId', 'isim isletmeAdi klinikAdi')
      .lean();
    await DanismaMesaji.updateMany(
      { gonderenId: otherIdObj, aliciId: userIdObj, okundu: false },
      { $set: { okundu: true } }
    );
    res.json(list);
  } catch (error) {
    console.error('Danisma messages error:', error);
    res.status(500).json({ message: 'Mesajlar alınamadı.' });
  }
});

module.exports = router;
