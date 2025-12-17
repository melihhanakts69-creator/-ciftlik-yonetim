const mongoose = require('mongoose');

const yemHareketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  yemTipi: {
    type: String,
    required: true
  },
  hareketTipi: {
    type: String,
    required: true,
    enum: ['Alım', 'Tüketim', 'Fire']
  },
  miktar: {
    type: Number,
    required: true
  },
  birimFiyat: {
    type: Number,
    default: 0
  },
  toplamTutar: {
    type: Number,
    default: 0
  },
  tarih: {
    type: String,
    required: true
  },
  aciklama: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('YemHareket', yemHareketSchema);