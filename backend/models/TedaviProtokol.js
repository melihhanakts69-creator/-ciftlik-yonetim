const mongoose = require('mongoose');

const tedaviProtokolSchema = new mongoose.Schema({
    veterinerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    ad: {
        type: String,
        required: true,
        trim: true
    },
    hastalik: {
        type: String,
        trim: true
    },
    tip: {
        type: String,
        enum: ['hastalik', 'tedavi', 'asi', 'muayene'],
        default: 'hastalik'
    },
    tani: {
        type: String,
        trim: true
    },
    tedaviNotu: {
        type: String,
        trim: true
    },
    ilaclar: [{
        ilacAdi: { type: String, trim: true },
        doz: { type: String, trim: true },
        sure: { type: String, trim: true }
    }],
    kullanilmaSayisi: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

tedaviProtokolSchema.index({ veterinerId: 1, createdAt: -1 });

module.exports = mongoose.model('TedaviProtokol', tedaviProtokolSchema);
