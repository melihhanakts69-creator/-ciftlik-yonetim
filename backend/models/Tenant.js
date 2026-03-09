const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    ownerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Abonelik / plan bilgileri
    plan: {
      type: String,
      enum: ['free', 'trial', 'pro', 'vet_pro', 'isletme'],
      default: 'trial',
    },
    planEndsAt: {
      type: Date,
      default: null,
    },
    hayvanLimiti: {
      type: Number,
      default: 20, // free plan: 20 hayvan, pro: sınırsız (null)
    },
    subscriptionStatus: {
      type: String,
      enum: ['trialing', 'active', 'past_due', 'canceled'],
      default: 'trialing',
    },
    iyzipayCustomerId: {
      type: String,
      trim: true,
      default: null,
    },
    iyzipaySubscriptionId: {
      type: String,
      trim: true,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      trim: true,
    },
    trialEndsAt: {
      type: Date,
    },
    // Veteriner/toplayıcının çiftliği koda göre eklemesi için (sadece çiftlik tenant'larında dolu)
    ciftlikKodu: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true,
    },
  },
  { timestamps: true }
);

tenantSchema.index({ slug: 1 }, { unique: true, sparse: true });
tenantSchema.index({ ciftlikKodu: 1 }, { unique: true, sparse: true });

// Benzersiz çiftlik kodu üret (8 karakter, büyük harf + rakam)
tenantSchema.statics.generateCiftlikKodu = async function () {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  let exists = true;
  while (exists) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const found = await this.findOne({ ciftlikKodu: code });
    exists = !!found;
  }
  return code;
};

module.exports = mongoose.model('Tenant', tenantSchema);

