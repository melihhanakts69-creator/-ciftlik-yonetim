const mongoose = require('mongoose');

const inekSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isim: {
    type: String,
    required: true,
    trim: true
  },
  yas: {
    type: Number,
    required: true
  },
  kilo: {
    type: Number,
    required: true
  },
  kupeNo: {
    type: String,
    required: true,
    trim: true
  },
  dogumTarihi: {
    type: String
  },
  buzagiSayisi: {
    type: Number,
    default: 0
  },
  notlar: {
    type: String,
    trim: true
  },
  durum: {
    type: String,
    default: 'Aktif',
    enum: ['Aktif', 'Satıldı', 'Öldü', 'Kuru Dönemde']
  },
  tohumlamaTarihi: {
    type: String,
    default: null
  },
  sonBuzagilamaTarihi: {
    type: String,
    default: null
  },
  laktasyonDonemi: {
    type: Number,
    default: 1
  },
  kuruDonemiBaslangic: {
    type: String,
    default: null
  },
  gebelikDurumu: {
    type: String,
    default: 'Belirsiz',
    enum: ['Gebe', 'Gebe Değil', 'Belirsiz']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inek', inekSchema);