const mongoose = require('mongoose');

/**
 * Veteriner cari hesap: Hangi çiftçiye ne kadar alacak yazıldı, ne kadar tahsil edildi.
 * Sağlık kaydı girilirken tutar (maliyet) varsa burada alacak olarak düşer.
 */
const veterinerCariSchema = new mongoose.Schema({
  veterinerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  ciftciId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tutar: { type: Number, required: true, min: 0 },           // Alacak (tek kalem)
  odenenTutar: { type: Number, default: 0, min: 0 },          // Bu kalemden tahsil edilen
  aciklama: { type: String, trim: true, default: '' },
  saglikKaydiId: { type: mongoose.Schema.Types.ObjectId, ref: 'SaglikKaydi', default: null },
  tarih: { type: Date, default: Date.now },
  vadeTarihi: { type: Date, default: null },
  odemeTarihi: { type: Date, default: null },                 // Son tahsilat tarihi (veya kapatıldığında)
  durum: { type: String, enum: ['acik', 'kapali'], default: 'acik' },
}, { timestamps: true });

veterinerCariSchema.index({ veterinerId: 1, ciftciId: 1, tarih: -1 });
veterinerCariSchema.index({ ciftciId: 1, tarih: -1 });

module.exports = mongoose.model('VeterinerCari', veterinerCariSchema);
