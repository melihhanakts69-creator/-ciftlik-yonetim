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

// Statik method: Kullanıcının tüm aktif grupları
grupSchema.statics.kullaniciGruplari = async function (userId) {
  return await this.find({
    userId,
    aktif: true
  })
    .sort({ ad: 1 });
};

// Pre-save hook: Renk varsayılanı
grupSchema.pre('save', function (next) {
  if (!this.renk) {
    const renkler = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];
    this.renk = renkler[Math.floor(Math.random() * renkler.length)];
  }
  next();
});

const Grup = mongoose.model('Grup', grupSchema);

module.exports = Grup;
