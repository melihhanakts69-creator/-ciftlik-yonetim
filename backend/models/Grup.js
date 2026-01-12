const mongoose = require('mongoose');

const grupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ad: {
    type: String,
    required: true,
    trim: true
  },
  aciklama: {
    type: String,
    trim: true,
    default: ''
  },
  renk: {
    type: String, // Hex renk kodu (UI için)
    default: '#4CAF50'
  },
  tip: {
    type: String,
    enum: ['inek', 'duve', 'buzagi', 'tosun', 'karma'], // Karma = karışık
    default: 'karma'
  },
  aktif: {
    type: Boolean,
    default: true
  },
  // Grup özellikleri
  ozellikler: {
    yemTipi: {
      type: String,
      trim: true
    },
    yemMiktari: {
      type: Number, // Günlük kg
      min: 0
    },
    sagimSaati: {
      type: String // "06:00, 18:00" gibi
    },
    barınak: {
      type: String,
      trim: true
    },
    notlar: {
      type: String,
      trim: true
    }
  },
  // İstatistikler (cache için)
  istatistikler: {
    toplamHayvan: {
      type: Number,
      default: 0
    },
    ortalamaYas: {
      type: Number,
      default: 0
    },
    ortalamaSut: {
      type: Number,
      default: 0
    },
    guncellemeTarihi: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index'ler
grupSchema.index({ userId: 1, aktif: 1 });
grupSchema.index({ userId: 1, tip: 1 });

// Virtual: Hayvanlar (populate için)
grupSchema.virtual('hayvanlar', {
  ref: 'Animal',
  localField: '_id',
  foreignField: 'grupId'
});

// Instance method: İstatistikleri güncelle
grupSchema.methods.istatistikleriGuncelle = async function() {
  const Animal = mongoose.model('Animal');

  // Bu gruba ait hayvanları bul
  const hayvanlar = await Animal.find({ grupId: this._id });

  this.istatistikler.toplamHayvan = hayvanlar.length;

  if (hayvanlar.length > 0) {
    // Ortalama yaş hesapla
    const toplamYas = hayvanlar.reduce((acc, h) => {
      if (h.dogum_tarihi) {
        const yas = (new Date() - new Date(h.dogum_tarihi)) / (365 * 24 * 60 * 60 * 1000);
        return acc + yas;
      }
      return acc;
    }, 0);
    this.istatistikler.ortalamaYas = hayvanlar.length > 0 ? toplamYas / hayvanlar.length : 0;

    // Ortalama süt verimi (sadece inekler için)
    const inekler = hayvanlar.filter(h => h.tip === 'inek');
    if (inekler.length > 0) {
      const toplamSut = inekler.reduce((acc, h) => acc + (h.gunluk_sut || 0), 0);
      this.istatistikler.ortalamaSut = toplamSut / inekler.length;
    }
  }

  this.istatistikler.guncellemeTarihi = new Date();

  return this.save();
};

// Statik method: Kullanıcının tüm grupları
grupSchema.statics.kullaniciGruplari = async function(userId) {
  return await this.find({
    userId: mongoose.Types.ObjectId(userId),
    aktif: true
  })
  .sort({ ad: 1 });
};

// Statik method: Gruba hayvan ekle
grupSchema.statics.hayvanEkle = async function(grupId, hayvanId) {
  const Animal = mongoose.model('Animal');

  await Animal.findByIdAndUpdate(hayvanId, {
    grupId: mongoose.Types.ObjectId(grupId)
  });

  // İstatistikleri güncelle
  const grup = await this.findById(grupId);
  if (grup) {
    await grup.istatistikleriGuncelle();
  }

  return grup;
};

// Statik method: Gruptan hayvan çıkar
grupSchema.statics.hayvanCikar = async function(grupId, hayvanId) {
  const Animal = mongoose.model('Animal');

  await Animal.findByIdAndUpdate(hayvanId, {
    $unset: { grupId: "" }
  });

  // İstatistikleri güncelle
  const grup = await this.findById(grupId);
  if (grup) {
    await grup.istatistikleriGuncelle();
  }

  return grup;
};

// Statik method: Grup istatistikleri
grupSchema.statics.grupIstatistikleri = async function(userId) {
  const gruplar = await this.find({
    userId: mongoose.Types.ObjectId(userId),
    aktif: true
  });

  const Animal = mongoose.model('Animal');

  const toplamHayvan = await Animal.countDocuments({
    userId: mongoose.Types.ObjectId(userId)
  });

  const gruplaHayvan = await Animal.countDocuments({
    userId: mongoose.Types.ObjectId(userId),
    grupId: { $exists: true, $ne: null }
  });

  const gruplariHayvan = toplamHayvan - gruplaHayvan;

  return {
    toplamGrup: gruplar.length,
    toplamHayvan,
    gruplaHayvan,
    gruplariHayvan
  };
};

// Pre-save hook: Renk varsayılanı
grupSchema.pre('save', function(next) {
  if (!this.renk) {
    const renkler = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
    this.renk = renkler[Math.floor(Math.random() * renkler.length)];
  }
  next();
});

const Grup = mongoose.model('Grup', grupSchema);

module.exports = Grup;
