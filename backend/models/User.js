const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  isim: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  sifre: {
    type: String,
    required: true
  },
  isletmeAdi: {
    type: String,
    required: true,
    trim: true
  },
  telefon: {
    type: String,
    trim: true
  },
  kayitTarihi: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);