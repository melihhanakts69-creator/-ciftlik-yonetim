const mongoose = require('mongoose');

const inekSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null,
    index: true,
  },
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
    type: Date
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
    enum: ['Aktif', 'Satıldı', 'Öldü', 'Kuru Dönemde', 'Silindi']
  },
  aktif: { type: Boolean, default: true },
  silinmeTarihi: { type: Date, default: null },
  tohumlamaTarihi: {
    type: Date,
    default: null
  },
  sonBuzagilamaTarihi: {
    type: Date,
    default: null
  },
  laktasyonDonemi: {
    type: Number,
    default: 1
  },
  kuruDonemiBaslangic: {
    type: Date,
    default: null
  },
  gebelikDurumu: {
    type: String,
    default: 'Belirsiz',
    enum: ['Gebe', 'Gebe Değil', 'Belirsiz']
  },
  grupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grup',
    default: null
  }
}, {
  timestamps: true
});

inekSchema.index({ userId: 1, tenantId: 1 });

module.exports = mongoose.model('Inek', inekSchema);