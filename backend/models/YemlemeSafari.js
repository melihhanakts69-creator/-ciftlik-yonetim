const mongoose = require('mongoose');

const yemlemeSafariSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tarih: {
    type: String,
    required: true
  },
  grupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grup',
    required: true
  },
  rasyonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rasyon',
    default: null
  },
  basCount: {
    type: Number,
    required: true,
    default: 0
  },
  planlanenKg: {
    type: Number,
    default: 0
  },
  verilenKg: {
    type: Number,
    default: 0
  },
  sapmaKg: {
    type: Number,
    default: 0
  },
  sapmaYuzde: {
    type: Number,
    default: 0
  },
  maliyet: {
    type: Number,
    default: 0
  },
  kalemler: [{
    yemId: { type: mongoose.Schema.Types.ObjectId, ref: 'YemKutuphanesi' },
    yemAdi: String,
    planlanenKg: Number,
    verilenKg: Number
  }]
}, { timestamps: true });

yemlemeSafariSchema.index({ userId: 1, tarih: 1 });
yemlemeSafariSchema.index({ userId: 1, grupId: 1, tarih: 1 });

module.exports = mongoose.model('YemlemeSafari', yemlemeSafariSchema);
