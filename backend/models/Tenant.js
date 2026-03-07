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
    // Abonelik / plan bilgileri - şimdilik basit tutuyoruz
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro'],
      default: 'basic',
    },
    subscriptionStatus: {
      type: String,
      enum: ['trialing', 'active', 'past_due', 'canceled'],
      default: 'trialing',
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

