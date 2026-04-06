const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const SutKaydi = require('../models/SutKaydi');

// TÜM SÜT KAYITLARINI GETİR
router.get('/', auth, checkRole(['ciftci', 'sutcu']), async (req, res) => {
  try {
    const sutKayitlari = await SutKaydi.find({ userId: req.userId }).sort({ tarih: -1 });
    res.json(sutKayitlari);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

const User = require('../models/User');

// YENİ SÜT KAYDI EKLE
router.post('/', auth, checkRole(['ciftci', 'sutcu']), async (req, res) => {
  try {
    const { inekId, inekIsim, tarih, litre, sagim } = req.body;
    const gelenSagim = sagim || 'sabah';

    // -- DİNAMİK TOPLAYICI KİLİT KONTROLÜ BAŞLANGIÇ --
    const toplayiciKayitlari = await SutKaydi.find({
      userId: req.userId,
      tarih: tarih,
      toplayiciUserId: { $ne: null }
    }).populate('toplayiciUserId', 'toplamaRutini');

    if (toplayiciKayitlari.length > 0) {
      for (const tKayit of toplayiciKayitlari) {
        const rutin = tKayit.toplayiciUserId?.toplamaRutini || 'ikisi';
        
        if (tKayit.sagim === 'ikisi' || rutin === 'sabah' || rutin === 'aksam' || (rutin === 'ikisi' && tKayit.sagim === gelenSagim)) {
          return res.status(403).json({ message: `Süt toplayıcısı bu sağımı (${tKayit.sagim === 'ikisi' ? 'tüm gün' : tKayit.sagim}) teslim almış. Daha fazla kayıt ekleyemezsiniz.` });
        }
      }
    }
    // -- KİLİT KONTROLÜ BİTİŞ --

    console.log('Gelen veri:', { inekId, inekIsim, tarih, litre, sagim: gelenSagim, userId: req.userId });

    const sutKaydi = new SutKaydi({
      userId: req.userId,
      inekId,
      inekIsim,
      tarih,
      litre,
      sagim: gelenSagim
    });

    await sutKaydi.save();
    console.log('Kayıt başarılı:', sutKaydi);
    res.status(201).json(sutKaydi);
  } catch (error) {
    console.error('❌ SÜT KAYDI HATASI:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// SÜT KAYDI SİL
router.delete('/:id', auth, checkRole(['ciftci', 'sutcu']), async (req, res) => {
  try {
    const sutKaydi = await SutKaydi.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!sutKaydi) {
      return res.status(404).json({ message: 'Süt kaydı bulunamadı' });
    }

    res.json({ message: 'Süt kaydı silindi', sutKaydi });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// TARİH VE SAĞIMA GÖRE TOPLU SİL
router.delete('/toplu-sil/tarih', auth, checkRole(['ciftci', 'sutcu']), async (req, res) => {
  try {
    const { tarih, sagim } = req.body;

    let query = {
      userId: req.userId,
      tarih: tarih
    };

    if (sagim && sagim !== 'ikisi') {
      query.sagim = sagim;
    }

    const silinen = await SutKaydi.deleteMany(query);

    res.json({
      message: 'Kayıtlar silindi!',
      silinenSayisi: silinen.deletedCount
    });
  } catch (error) {
    console.error('Toplu silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// SEÇİLİ KAYITLARI SİL
router.delete('/toplu-sil/secili', auth, checkRole(['ciftci', 'sutcu']), async (req, res) => {
  try {
    const { kayitIdler } = req.body;

    if (!kayitIdler || kayitIdler.length === 0) {
      return res.status(400).json({ message: 'Silinecek kayıt seçilmedi!' });
    }

    const silinen = await SutKaydi.deleteMany({
      _id: { $in: kayitIdler },
      userId: req.userId
    });

    res.json({
      message: 'Seçili kayıtlar silindi!',
      silinenSayisi: silinen.deletedCount
    });
  } catch (error) {
    console.error('Seçili silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;