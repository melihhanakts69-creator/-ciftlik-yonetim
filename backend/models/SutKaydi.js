const mongoose = require('mongoose');

const sutKaydiSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inekId: {
    type: String,
    required: true
  },
  inekIsim: {
    type: String,
    required: true
  },
  tarih: {
    type: String,
    required: true
  },
  litre: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SutKaydi', sutKaydiSchema);
