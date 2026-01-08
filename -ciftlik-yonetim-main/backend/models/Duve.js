const mongoose = require('mongoose');

const duveSchema = new mongoose.Schema({
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
  tohumlamaTarihi: {
    type: String
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
    type: String
  }
  
  
}, {
  timestamps: true
});

module.exports = mongoose.model('Duve', duveSchema);