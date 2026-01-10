const mongoose = require('mongoose')

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
  },  sagim: {
    type: String,
    enum: ['sabah', 'aksam'],
    default: 'sabah'
  },
  topluGiristen: {
    type: Boolean,
    default: false
  },
  topluGirisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TopluSutGirisi',
    default: null
  }
}, {
  timestamps: true
  
});

module.exports = mongoose.model('SutKaydi', sutKaydiSchema);

