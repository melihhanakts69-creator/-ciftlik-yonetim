const mongoose = require('mongoose');

const danismaMesajiSchema = new mongoose.Schema({
  gonderenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  aliciId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mesaj: { type: String, required: true, trim: true },
  okundu: { type: Boolean, default: false },
}, { timestamps: true });

danismaMesajiSchema.index({ gonderenId: 1, aliciId: 1, createdAt: -1 });
danismaMesajiSchema.index({ aliciId: 1, gonderenId: 1, createdAt: -1 });

module.exports = mongoose.model('DanismaMesaji', danismaMesajiSchema);
