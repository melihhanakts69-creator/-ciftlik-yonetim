const mongoose = require('mongoose');

const stokSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    urunAdi: {
        type: String,
        required: true,
        trim: true
    },
    kategori: {
        type: String,
        enum: ['Yem', 'İlaç', 'Antibiyotik', 'Vitamin', 'Anti-inflamatuar', 'Aşı', 'Biyolojik', 'Paraziter', 'Tohum', 'Sperma', 'Ekipman', 'Diğer'],
        default: 'Diğer'
    },
    miktar: {
        type: Number,
        required: true,
        default: 0
    },
    birim: {
        type: String,
        enum: ['kg', 'lt', 'ml', 'litre', 'gram', 'adet', 'torba', 'kutu', 'doz', 'şişe', 'pipet'],
        default: 'adet'
    },
    kritikSeviye: {
        type: Number,
        default: 10
    },
    sonGuncelleme: {
        type: Date,
        default: Date.now
    },
    notlar: {
        type: String
    },
    yemKutuphanesiId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'YemKutuphanesi',
        required: false
    },
    // Yem besin değerleri (YemKutuphanesi'nden cache, kategori: Yem için)
    yemBilgi: {
        kuruMadde: { type: Number, default: 0 },
        hammProtein: { type: Number, default: 0 },
        metabolikEnerji: { type: Number, default: 0 },
        ndf: { type: Number, default: 0 },
        nisasta: { type: Number, default: 0 }
    },
    // Otomatik hesaplanan (güncelleme sırasında)
    gunlukTuketim: { type: Number, default: 0 },
    yeterlilikGun: { type: Number, default: 999 }
}, { timestamps: true });

module.exports = mongoose.model('Stok', stokSchema);
