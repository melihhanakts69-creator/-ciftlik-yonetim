const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hayvanId: {
    type: String,
    required: true
  },
  hayvanTipi: {
    type: String,
    required: true,
    enum: ['inek', 'buzagi', 'duve']
  },
  tip: {
    type: String,
    required: true,
    enum: ['dogum', 'tohumlama', 'buzagi', 'hastalik', 'asi', 'satis', 'kuru-donem', 'diger']
  },
  tarih: {
    type: String,
    required: true
  },
  aciklama: {
    type: String,
    default: ''
  },
  iliskiliHayvanId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Timeline', timelineSchema);