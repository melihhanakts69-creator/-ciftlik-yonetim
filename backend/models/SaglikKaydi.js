const mongoose = require('mongoose');

const saglikKaydiSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    hayvanId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    hayvanTipi: {
        type: String,
        required: true,
        enum: ['inek', 'duve', 'buzagi', 'tosun']
    },
    hayvanIsim: {
        type: String,
        trim: true
    },
    hayvanKupeNo: {
        type: String,
        trim: true
    },
    tip: {
        type: String,
        required: true,
        enum: ['hastalik', 'tedavi', 'asi', 'muayene', 'ameliyat', 'dogum_komplikasyonu']
    },
    tarih: {
        type: Date,
        required: true,
        default: Date.now
    },
    tani: {
        type: String,
        required: true,
        trim: true
    },
    belirtiler: [{
        type: String,
        trim: true
    }],
    tedavi: {
        type: String,
        trim: true
    },
    ilaclar: [{
        ilacAdi: {
            type: String,
            required: true,
            trim: true
        },
        doz: {
            type: String,
            trim: true
        },
        sure: {
            type: String,
            trim: true
        }
    }],
    veteriner: {
        type: String,
        trim: true
    },
    maliyet: {
        type: Number,
        default: 0
    },
    durum: {
        type: String,
        enum: ['devam_ediyor', 'iyilesti', 'kronik', 'oldu'],
        default: 'devam_ediyor'
    },
    sonrakiKontrol: {
        type: Date
    },
    notlar: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// İndexler
saglikKaydiSchema.index({ userId: 1, hayvanId: 1 });
saglikKaydiSchema.index({ userId: 1, tip: 1 });
saglikKaydiSchema.index({ userId: 1, tarih: -1 });
saglikKaydiSchema.index({ userId: 1, durum: 1 });

// Statik: Hayvanın sağlık geçmişi
saglikKaydiSchema.statics.hayvanGecmisi = async function (userId, hayvanId) {
    return await this.find({
        userId: new mongoose.Types.ObjectId(userId),
        hayvanId: new mongoose.Types.ObjectId(hayvanId)
    }).sort({ tarih: -1 });
};

// Statik: Aktif tedaviler
saglikKaydiSchema.statics.aktifTedaviler = async function (userId) {
    return await this.find({
        userId: new mongoose.Types.ObjectId(userId),
        durum: 'devam_ediyor'
    }).sort({ tarih: -1 });
};

// Statik: İstatistikler
saglikKaydiSchema.statics.istatistikler = async function (userId) {
    const ObjectId = new mongoose.Types.ObjectId(userId);

    const aktifTedavi = await this.countDocuments({
        userId: ObjectId,
        durum: 'devam_ediyor'
    });

    const buAyBaslangic = new Date();
    buAyBaslangic.setDate(1);
    buAyBaslangic.setHours(0, 0, 0, 0);

    const buAyAsi = await this.countDocuments({
        userId: ObjectId,
        tip: 'asi',
        tarih: { $gte: buAyBaslangic }
    });

    const yediGunSonra = new Date();
    yediGunSonra.setDate(yediGunSonra.getDate() + 7);

    const yaklasanKontrol = await this.countDocuments({
        userId: ObjectId,
        sonrakiKontrol: {
            $gte: new Date(),
            $lte: yediGunSonra
        },
        durum: 'devam_ediyor'
    });

    const aylikMaliyet = await this.aggregate([
        {
            $match: {
                userId: ObjectId,
                tarih: { $gte: buAyBaslangic },
                maliyet: { $gt: 0 }
            }
        },
        {
            $group: {
                _id: null,
                toplam: { $sum: '$maliyet' }
            }
        }
    ]);

    return {
        aktifTedavi,
        buAyAsi,
        yaklasanKontrol,
        aylikMaliyet: aylikMaliyet[0]?.toplam || 0
    };
};

module.exports = mongoose.model('SaglikKaydi', saglikKaydiSchema);
