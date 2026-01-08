const mongoose = require('mongoose');

const topluSutGirisiSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tarih: {
    type: String,
    required: true
  },
  sagim: {
    type: String,
    required: true,
    enum: ['sabah', 'aksam']
  },
  toplamSut: {
    type: Number,
    required: true,
    min: 0
  },
  dagilimTipi: {
    type: String,
    required: true,
    enum: ['akilli', 'esit', 'manuel'],
    default: 'akilli'
  },
  detaylar: [{
    inekId: {
      type: String,
      required: true
    },
    inekIsim: {
      type: String,
      required: true
    },
    miktar: {
      type: Number,
      required: true,
      min: 0
    },
    otomatikMi: {
      type: Boolean,
      default: true
    },
    duzenlenmis: {
      type: Boolean,
      default: false
    }
  }],
  notlar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
topluSutGirisiSchema.index({ userId: 1, tarih: -1 });

module.exports = mongoose.model('TopluSutGirisi', topluSutGirisiSchema);