const mongoose = require('mongoose');

const veterinerRandevuSchema = new mongoose.Schema({
  veterinerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ciftciId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  baslik: { type: String, required: true, trim: true },
  tarih: { type: Date, required: true },
  saat: { type: String, trim: true, default: '' },
  aciklama: { type: String, trim: true, default: '' },
  hayvanId: { type: mongoose.Schema.Types.ObjectId, default: null },
  durum: { type: String, enum: ['planlandi', 'tamamlandi', 'iptal'], default: 'planlandi' },
}, { timestamps: true });

veterinerRandevuSchema.index({ veterinerId: 1, tarih: 1 });

module.exports = mongoose.model('VeterinerRandevu', veterinerRandevuSchema);
