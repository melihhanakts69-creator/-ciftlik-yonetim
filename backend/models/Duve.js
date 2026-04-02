const mongoose = require('mongoose');

const duveSchema = new mongoose.Schema({
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
  anneKupeNo: {
    type: String,
    trim: true
  },
  babaKupeNo: {
    type: String,
    trim: true
  },
  tohumlamaTarihi: {
    type: Date
  },
  gebelikDurumu: {
    type: String,
    enum: ['Belirsiz', 'Gebe', 'Gebe Değil'],
    default: 'Belirsiz'
  },
  notlar: {
    type: String,
    trim: true
  },
  eklemeTarihi: {
    type: Date
  },
  grupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grup',
    default: null
  },
  aktif: { type: Boolean, default: true },
  silinmeTarihi: { type: Date, default: null }
}, {
  timestamps: true
});

duveSchema.index({ userId: 1, tenantId: 1 });

module.exports = mongoose.model('Duve', duveSchema);