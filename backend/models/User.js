const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ── SaaS / Tenant alanı ───────────────────────────
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null },
  // ── Temel alanlar (tüm roller) ──────────────────
  isim: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true }, // unique: email+rol compound index
  sifre: { type: String, required: true },
  telefon: { type: String, trim: true },
  aktif: { type: Boolean, default: true },
  sonGiris: { type: Date },
  kayitTarihi: { type: Date, default: Date.now },

  // ── Alt Hesap Mantığı (Personel) ────────────────
  parentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // ── Rol sistemi ─────────────────────────────────
  rol: {
    type: String,
    enum: ['ciftci', 'veteriner', 'sutcu', 'toplayici'],
    default: 'ciftci'
  },

  // ── Çiftçi alanları ─────────────────────────────
  isletmeAdi: { type: String, trim: true },  // çiftçi için işletme adı
  sehir: { type: String, trim: true },
  logoUrl: { type: String, trim: true }, // Çiftlik özel logosu

  // ── Veteriner alanları ───────────────────────────
  lisansNo: { type: String, trim: true },
  uzmanlik: { type: String, trim: true },    // örn: "Büyükbaş Hayvanlar"
  klinikAdi: { type: String, trim: true },
  onaylandi: { type: Boolean, default: false }, // admin onayı
  musteriler: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Veteriner'in takip ettiği çiftçiler

  // ── Süt Toplayıcı alanları ───────────────────────
  firmaAdi: { type: String, trim: true },
  bolge: { type: String, trim: true },
  topladigiCiftlikler: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Kod ile eklediği çiftlikler (çiftçi User id)

  // ── Profil ───────────────────────────────────────
  profilFoto: { type: String },  // URL

}, { timestamps: true });

// Aynı email farklı rollerle kayıt olabilir
// Email + Rol kombinasyonu unique olmalı
userSchema.index({ email: 1, rol: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
