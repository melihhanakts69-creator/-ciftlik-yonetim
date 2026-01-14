const mongoose = require('mongoose');

const bildirimSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tip: {
    type: String,
    required: true,
    enum: [
      'dogum',           // Doğum yaklaşıyor
      'asi',             // Aşı zamanı
      'muayene',         // Muayene zamanı
      'kizginlik',       // Kızgınlık döngüsü
      'kuru_donem',      // Kuru döneme geçiş
      'sagim',           // Sağım hatırlatması
      'yem',             // Yem stoku azaldı
      'sistem',          // Sistem bildirimi
      'odeme',           // Ödeme hatırlatması
      'diger'
    ],
    default: 'diger'
  },
  baslik: {
    type: String,
    required: true,
    trim: true
  },
  mesaj: {
    type: String,
    required: true,
    trim: true
  },
  hayvanId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Bildirim hayvana özel olmayabilir
  },
  hayvanTipi: {
    type: String,
    enum: ['inek', 'duve', 'buzagi', 'tosun', 'genel'],
    default: 'genel'
  },
  kupe_no: {
    type: String,
    trim: true
  },
  oncelik: {
    type: String,
    enum: ['dusuk', 'normal', 'yuksek', 'acil'],
    default: 'normal'
  },
  okundu: {
    type: Boolean,
    default: false
  },
  okunmaTarihi: {
    type: Date
  },
  hatirlatmaTarihi: {
    type: Date, // Hatırlatma zamanı
    required: true,
    default: Date.now
  },
  tekrarla: {
    type: Boolean, // Tekrarlayan bildirim mi?
    default: false
  },
  tekrarSikligi: {
    type: String,
    enum: ['gunluk', 'haftalik', 'aylik', 'yillik'],
    default: 'gunluk'
  },
  aktif: {
    type: Boolean, // Aktif mi (silinmemiş mi)?
    default: true
  },
  tamamlandi: {
    type: Boolean, // Görev tamamlandı mı?
    default: false
  },
  tamamlanmaTarihi: {
    type: Date
  },
  // Ek veriler (JSON olarak esnek yapı)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index'ler
bildirimSchema.index({ userId: 1, hatirlatmaTarihi: -1 });
bildirimSchema.index({ userId: 1, okundu: 1 });
bildirimSchema.index({ userId: 1, aktif: 1 });
bildirimSchema.index({ userId: 1, tip: 1 });
bildirimSchema.index({ userId: 1, tamamlandi: 1 });
bildirimSchema.index({ userId: 1, oncelik: 1 });

// Virtual: Geç kaldı mı?
bildirimSchema.virtual('gecKaldi').get(function () {
  return !this.tamamlandi && this.hatirlatmaTarihi < new Date();
});

// Instance method: Bildirimi okundu olarak işaretle
bildirimSchema.methods.okunduIsaretle = function () {
  this.okundu = true;
  this.okunmaTarihi = new Date();
  return this.save();
};

// Instance method: Tamamlandı olarak işaretle
bildirimSchema.methods.tamamlandiIsaretle = function () {
  this.tamamlandi = true;
  this.tamamlanmaTarihi = new Date();
  return this.save();
};

// Statik method: Okunmamış bildirimler
bildirimSchema.statics.okunmayanlar = async function (userId) {
  return await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    okundu: false,
    aktif: true
  })
    .sort({ oncelik: -1, hatirlatmaTarihi: 1 })
    .limit(50);
};

// Statik method: Bugünün bildirimleri
bildirimSchema.statics.bugununkiler = async function (userId) {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

  const yarin = new Date(bugun);
  yarin.setDate(yarin.getDate() + 1);

  return await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    hatirlatmaTarihi: {
      $gte: bugun,
      $lt: yarin
    },
    aktif: true
  })
    .sort({ oncelik: -1, hatirlatmaTarihi: 1 });
};

// Statik method: Gecikmiş bildirimler
bildirimSchema.statics.gecikmisler = async function (userId) {
  const simdi = new Date();

  return await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    hatirlatmaTarihi: { $lt: simdi },
    tamamlandi: false,
    aktif: true
  })
    .sort({ oncelik: -1, hatirlatmaTarihi: 1 });
};

// Statik method: Yaklaşan bildirimler (7 gün içinde)
bildirimSchema.statics.yaklaşanlar = async function (userId, gun = 7) {
  const simdi = new Date();
  const gelecek = new Date();
  gelecek.setDate(gelecek.getDate() + gun);

  return await this.find({
    userId: new mongoose.Types.ObjectId(userId),
    hatirlatmaTarihi: {
      $gte: simdi,
      $lte: gelecek
    },
    tamamlandi: false,
    aktif: true
  })
    .sort({ hatirlatmaTarihi: 1 });
};

// Statik method: Bildirim istatistikleri
bildirimSchema.statics.istatistikler = async function (userId) {
  const toplam = await this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    aktif: true
  });

  const okunmayan = await this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    okundu: false,
    aktif: true
  });

  const geciken = await this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    hatirlatmaTarihi: { $lt: new Date() },
    tamamlandi: false,
    aktif: true
  });

  const tamamlanan = await this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    tamamlandi: true
  });

  return {
    toplam,
    okunmayan,
    geciken,
    tamamlanan
  };
};

const Bildirim = mongoose.model('Bildirim', bildirimSchema);

module.exports = Bildirim;
