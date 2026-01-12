const mongoose = require('mongoose');

const alisSatisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tip: {
    type: String,
    required: true,
    enum: ['alis', 'satis'],
    default: 'alis'
  },
  hayvanId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Alışta henüz ID olmayabilir
  },
  hayvanTipi: {
    type: String,
    required: true,
    enum: ['inek', 'duve', 'buzagi', 'tosun'],
    default: 'buzagi'
  },
  kupe_no: {
    type: String,
    trim: true
  },
  fiyat: {
    type: Number,
    required: true,
    min: 0
  },
  tarih: {
    type: Date,
    required: true,
    default: Date.now
  },
  aliciSatici: {
    type: String, // Alıcı veya satıcı adı
    required: true,
    trim: true
  },
  telefon: {
    type: String,
    trim: true
  },
  adres: {
    type: String,
    trim: true
  },
  odemeTipi: {
    type: String,
    enum: ['nakit', 'kredi', 'havale', 'cek', 'veresiye'],
    default: 'nakit'
  },
  odenenMiktar: {
    type: Number, // Ödenen tutar (veresiye durumunda)
    default: 0,
    min: 0
  },
  kalanBorc: {
    type: Number, // Kalan borç
    default: 0,
    min: 0
  },
  notlar: {
    type: String,
    trim: true,
    default: ''
  },
  // Hayvan özellikleri (alışta önemli)
  yas: {
    type: Number,
    min: 0
  },
  agirlik: {
    type: Number, // kg cinsinden
    min: 0
  },
  cinsiyet: {
    type: String,
    enum: ['erkek', 'dişi']
  },
  irk: {
    type: String,
    trim: true
  },
  durum: {
    type: String,
    enum: ['tamamlandi', 'beklemede', 'iptal'],
    default: 'tamamlandi'
  }
}, {
  timestamps: true
});

// Index'ler
alisSatisSchema.index({ userId: 1, tarih: -1 });
alisSatisSchema.index({ userId: 1, tip: 1 });
alisSatisSchema.index({ userId: 1, hayvanId: 1 });
alisSatisSchema.index({ userId: 1, durum: 1 });

// Virtual: Tam ödeme durumu
alisSatisSchema.virtual('tamOdendi').get(function() {
  return this.kalanBorc === 0;
});

// Statik method: Toplam alış tutarı
alisSatisSchema.statics.toplamAlis = async function(userId, baslangic, bitis) {
  const result = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        tip: 'alis',
        durum: 'tamamlandi',
        tarih: {
          $gte: new Date(baslangic),
          $lte: new Date(bitis)
        }
      }
    },
    {
      $group: {
        _id: null,
        toplam: { $sum: '$fiyat' },
        adet: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { toplam: 0, adet: 0 };
};

// Statik method: Toplam satış tutarı
alisSatisSchema.statics.toplamSatis = async function(userId, baslangic, bitis) {
  const result = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        tip: 'satis',
        durum: 'tamamlandi',
        tarih: {
          $gte: new Date(baslangic),
          $lte: new Date(bitis)
        }
      }
    },
    {
      $group: {
        _id: null,
        toplam: { $sum: '$fiyat' },
        adet: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { toplam: 0, adet: 0 };
};

// Statik method: Kar/Zarar hesaplama
alisSatisSchema.statics.karZarar = async function(userId, baslangic, bitis) {
  const alis = await this.toplamAlis(userId, baslangic, bitis);
  const satis = await this.toplamSatis(userId, baslangic, bitis);

  return {
    alis: alis.toplam,
    satis: satis.toplam,
    kar: satis.toplam - alis.toplam,
    alisSayisi: alis.adet,
    satisSayisi: satis.adet
  };
};

// Statik method: Veresiye borçlar
alisSatisSchema.statics.veresiyeler = async function(userId) {
  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        kalanBorc: { $gt: 0 },
        durum: 'tamamlandi'
      }
    },
    {
      $group: {
        _id: '$tip',
        toplamBorc: { $sum: '$kalanBorc' },
        adet: { $sum: 1 }
      }
    }
  ]);
};

const AlisSatis = mongoose.model('AlisSatis', alisSatisSchema);

module.exports = AlisSatis;
