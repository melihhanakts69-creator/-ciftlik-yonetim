const mongoose = require('mongoose');

const asiTakvimiSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    hayvanId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false // Toplu aşı için null olabilir
    },
    hayvanTipi: {
        type: String,
        enum: ['inek', 'duve', 'buzagi', 'tosun', 'hepsi'],
        default: 'hepsi'
    },
    hayvanIsim: {
        type: String,
        trim: true
    },
    hayvanKupeNo: {
        type: String,
        trim: true
    },
    asiAdi: {
        type: String,
        required: true,
        trim: true
    },
    uygulamaTarihi: {
        type: Date,
        required: true
    },
    sonrakiTarih: {
        type: Date
    },
    tekrarPeriyodu: {
        type: Number, // Gün olarak
        default: 0
    },
    uygulayan: {
        type: String,
        trim: true
    },
    doz: {
        type: String,
        trim: true
    },
    maliyet: {
        type: Number,
        default: 0
    },
    durum: {
        type: String,
        enum: ['yapildi', 'bekliyor', 'gecikti'],
        default: 'yapildi'
    },
    notlar: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// İndexler
asiTakvimiSchema.index({ userId: 1, sonrakiTarih: 1 });
asiTakvimiSchema.index({ userId: 1, durum: 1 });
asiTakvimiSchema.index({ userId: 1, hayvanId: 1 });

// Statik: Yaklaşan aşılar (7 gün içi)
asiTakvimiSchema.statics.yaklasanAsilar = async function (userId, gun = 7) {
    const simdi = new Date();
    const hedef = new Date();
    hedef.setDate(hedef.getDate() + gun);

    return await this.find({
        userId: new mongoose.Types.ObjectId(userId),
        sonrakiTarih: {
            $gte: simdi,
            $lte: hedef
        },
        durum: { $in: ['bekliyor', 'gecikti'] }
    }).sort({ sonrakiTarih: 1 });
};

// Statik: Gecikmiş aşılar
asiTakvimiSchema.statics.gecikmisAsilar = async function (userId) {
    return await this.find({
        userId: new mongoose.Types.ObjectId(userId),
        sonrakiTarih: { $lt: new Date() },
        durum: 'bekliyor'
    }).sort({ sonrakiTarih: 1 });
};

module.exports = mongoose.model('AsiTakvimi', asiTakvimiSchema);
