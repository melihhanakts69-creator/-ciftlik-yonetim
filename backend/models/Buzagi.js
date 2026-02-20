const mongoose = require('mongoose');

const buzagiSchema = new mongoose.Schema({
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
  kupeNo: {
    type: String,
    required: true,
    trim: true
  },
  anneId: {
    type: String
  },
  anneIsim: {
    type: String
  },
  anneKupeNo: {
    type: String,
    trim: true
  },
  babaKupeNo: {
    type: String,
    trim: true
  },
  dogumTarihi: {
    type: Date,
    required: true
  },
  cinsiyet: {
    type: String,
    enum: ['disi', 'erkek'],
    required: true
  },
  kilo: {
    type: Number,
    required: true
  },
  notlar: {
    type: String,
    trim: true
  },
  eklemeTarihi: {
    type: Date
  },
  durum: {
    type: String,
    default: 'Aktif',
    enum: ['Aktif', 'Satıldı', 'Öldü', 'Düveye Geçti', 'Tosuna Geçti']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Buzagi', buzagiSchema);