const mongoose = require('mongoose');

const FinansalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tip: {
    type: String,
    enum: ['gelir', 'gider'],
    required: true
  },
  kategori: {
    type: String,
    required: true
    // Gelir: 'sut-satisi', 'hayvan-satisi', 'diger-gelir'
    // Gider: 'yem', 'veteriner', 'iscilik', 'elektrik', 'su', 'bakim-onarim', 'diger-gider'
  },
  miktar: {
    type: Number,
    required: true,
    min: 0
  },
  tarih: {
    type: String,
    required: true
  },
  aciklama: {
    type: String,
    default: ''
  },
  ilgiliHayvanId: {
    type: String,
    default: null
  },
  ilgiliHayvanTipi: {
    type: String,
    enum: ['inek', 'duve', 'buzagi', 'tosun', null],
    default: null
  }
}, {
  timestamps: true
});

// Kullanıcıya göre index
FinansalSchema.index({ userId: 1, tarih: -1 });
FinansalSchema.index({ userId: 1, tip: 1 });

module.exports = mongoose.model('Finansal', FinansalSchema);
