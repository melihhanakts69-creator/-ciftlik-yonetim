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
 anneId: {
    type: String,
    required: true
  },
  anneIsim: {
    type: String,
    required: true
  },
  dogumTarihi: {
    type: String,
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
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Buzagi', buzagiSchema);