const mongoose = require('mongoose');

const rasyonSchema = new mongoose.Schema({
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
    aciklama: {
        type: String,
        trim: true
    },
    hedefGrup: {
        type: String, // 'sagmal', 'kuru', 'genc_duve', 'besi', 'buzagi' vb.
        required: true
    },
    icerik: [{
        yemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'YemKutuphanesi',
            required: true
        },
        yemAdi: String, // Yedek bilgi
        miktar: {
            type: Number, // kg (Hayvan başı günlük)
            required: true
        }
    }],
    // Otomatik hesaplanan toplam değerler (Cache amaçlı)
    toplamMaliyet: {
        type: Number, // TL (Hayvan başı günlük)
        default: 0
    },
    toplamKuruMadde: { type: Number, default: 0 },
    toplamProtein: { type: Number, default: 0 },
    toplamEnerji: { type: Number, default: 0 },

    aktif: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Rasyon', rasyonSchema);
