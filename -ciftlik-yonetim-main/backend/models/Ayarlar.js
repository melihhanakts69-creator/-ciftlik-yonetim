const mongoose = require('mongoose');

const ayarlarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  otomatikYemTuketim: {
    type: Boolean,
    default: true
  },
  sonTuketimTarihi: {
    type: String,
    default: null
  },
  // Günlük tüketim miktarları (inek başına kg)
  gunlukTuketim: {
    karmaYem: {
      type: Number,
      default: 8
    },
    arpa: {
      type: Number,
      default: 2
    },
    misir: {
      type: Number,
      default: 0
    },
    saman: {
      type: Number,
      default: 3
    },
    yonca: {
      type: Number,
      default: 0
    },
    kepek: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ayarlar', ayarlarSchema);