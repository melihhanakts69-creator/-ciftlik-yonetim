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
        enum: ['Yem', 'İlaç', 'Vitamin', 'Ekipman', 'Diğer'],
        default: 'Diğer'
    },
    miktar: {
        type: Number,
        required: true,
        default: 0
    },
    birim: {
        type: String,
        enum: ['kg', 'lt', 'adet', 'torba', 'kutu', 'doz'],
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
    }
}, { timestamps: true });

module.exports = mongoose.model('Stok', stokSchema);
