const mongoose = require('mongoose');

const yemKutuphanesiSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ad: {
        type: String,
        required: true,
        trim: true
    },
    kategori: {
        type: String,
        enum: ['kaba_yem', 'kesif_yem', 'vitamin_mineral', 'diger'],
        default: 'diger'
    },
    // Besin Değerleri (1 kg için)
    kuruMadde: {
        type: Number, // % olarak (örn: 35)
        default: 0
    },
    protein: {
        type: Number, // Ham Protein (% veya gr/kg)
        default: 0
    },
    enerji: {
        type: Number, // Metabolik Enerji (Mcal/kg)
        default: 0
    },
    nisasta: {
        type: Number, // %
        default: 0
    },
    // Maliyet ve Stok
    birimFiyat: {
        type: Number, // TL/kg
        required: true,
        default: 0
    },
    stokTakibi: {
        type: Boolean,
        default: true
    },
    stokMiktari: {
        type: Number, // kg
        default: 0
    },
    yemStokId: { // Mevcut YemStok modeliyle senkronize etmek istersek diye
        type: mongoose.Schema.Types.ObjectId,
        ref: 'YemStok',
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('YemKutuphanesi', yemKutuphanesiSchema);
