const mongoose = require('mongoose');

const yemStokSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  yemTipi: {
    type: String,
    required: true,
    trim: true
  },
  miktar: {
    type: Number,
    required: true,
    default: 0
  },
  birim: {
    type: String,
    required: true,
    default: 'kg'
  },
  minimumStok: {
    type: Number,
    default: 50
  },
  birimFiyat: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('YemStok', yemStokSchema);