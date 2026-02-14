const mongoose = require('mongoose');

const maliyetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  kategori: {
    type: String,
    required: true,
    enum: ['yem', 'ilac', 'veteriner', 'elektrik', 'su', 'aşı', 'muayene', 'diger'],
    default: 'diger'
  },
  tutar: {
    type: Number,
    required: true,
    min: 0
  },
  tarih: {
    type: Date,
    required: true,
    default: Date.now
  },
  hayvanId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Opsiyonel - belirli bir hayvana ait olabilir
  },
  hayvanTipi: {
    type: String,
    enum: ['inek', 'duve', 'buzagi', 'tosun', 'genel'],
    default: 'genel'
  },
  aciklama: {
    type: String,
    trim: true,
    default: ''
  },
  odemeTipi: {
    type: String,
    enum: ['nakit', 'kredi', 'havale', 'cek'],
    default: 'nakit'
  },
  fatura: {
    type: String, // Fatura numarası veya URL
    trim: true
  },
  miktar: {
    type: Number, // Yem miktarı, ilaç adedi vs.
    min: 0
  },
  birim: {
    type: String, // kg, lt, adet, kutu vs.
    trim: true
  }
}, {
  timestamps: true // createdAt, updatedAt otomatik
});

// Index'ler (hızlı sorgulama için)
maliyetSchema.index({ userId: 1, tarih: -1 });
maliyetSchema.index({ userId: 1, kategori: 1 });
maliyetSchema.index({ userId: 1, hayvanId: 1 });

// Virtual field: Ay ve yıl
maliyetSchema.virtual('ay').get(function () {
  return this.tarih.getMonth() + 1;
});

maliyetSchema.virtual('yil').get(function () {
  return this.tarih.getFullYear();
});

// Statik method: Toplam maliyet hesaplama
maliyetSchema.statics.toplamMaliyet = async function (userId, baslangic, bitis) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        tarih: {
          $gte: new Date(baslangic),
          $lte: new Date(bitis)
        }
      }
    },
    {
      $group: {
        _id: null,
        toplam: { $sum: '$tutar' }
      }
    }
  ]);

  return result.length > 0 ? result[0].toplam : 0;
};

// Statik method: Kategoriye göre maliyet
maliyetSchema.statics.kategoriyeGoreMaliyet = async function (userId, baslangic, bitis) {
  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        tarih: {
          $gte: new Date(baslangic),
          $lte: new Date(bitis)
        }
      }
    },
    {
      $group: {
        _id: '$kategori',
        toplam: { $sum: '$tutar' },
        adet: { $sum: 1 }
      }
    },
    {
      $sort: { toplam: -1 }
    }
  ]);
};

const Maliyet = mongoose.model('Maliyet', maliyetSchema);

module.exports = Maliyet;
