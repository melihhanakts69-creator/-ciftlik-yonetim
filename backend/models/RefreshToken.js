const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }  // TTL index — otomatik silinme
    }
}, {
    timestamps: true
});

// Yeni refresh token üret (tekillik çakışmasında yeniden dene)
refreshTokenSchema.statics.createToken = async function (userId) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün
    for (let attempt = 0; attempt < 5; attempt++) {
        const token = crypto.randomBytes(40).toString('hex');
        try {
            await this.create({ token, userId, expiresAt });
            return token;
        } catch (err) {
            if (err && err.code === 11000 && attempt < 4) continue;
            throw err;
        }
    }
};

// Token doğrula
refreshTokenSchema.statics.verifyToken = async function (token) {
    const refreshToken = await this.findOne({
        token,
        expiresAt: { $gt: new Date() }
    });
    return refreshToken;
};

// Kullanıcının tüm tokenlarını sil (logout)
refreshTokenSchema.statics.revokeAllUserTokens = async function (userId) {
    await this.deleteMany({ userId });
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
