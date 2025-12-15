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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inek', inekSchema);