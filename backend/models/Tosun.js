const mongoose = require('mongoose');

const tosunSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isim: {
    type: String,
    required: true
  },
  kupeNo: {
    type: String,
    required: true
  },
  dogumTarihi: {
    type: Date,
    required: true
  },
  anneKupeNo: String,
  babaKupeNo: String,
  kilo: {
    type: Number,
    default: 0
  },
  satisTarihi: Date,
  satisFiyati: Number,
  not: String,
  durum: {
    type: String,
    default: 'Aktif',
    enum: ['Aktif', 'Satıldı', 'Öldü']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tosun', tosunSchema);