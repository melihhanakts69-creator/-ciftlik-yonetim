const rateLimit = require('express-rate-limit');

// Genel API limiter: 15 dakikada 500 istek (tek sayfa ~5-10 istek yapıyor)
// Render / reverse proxy: trust proxy ile uyum için doğrulama hatasında middleware exception önlenir (500 yerine)
const limiterDefaults = {
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
};

const apiLimiter = rateLimit({
    ...limiterDefaults,
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { message: 'Çok fazla istek gönderildi, lütfen biraz bekleyip tekrar deneyin.' },
});

// Auth limiter: Login/Register brute-force koruması — 15 dakikada 20 deneme
const authLimiter = rateLimit({
    ...limiterDefaults,
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Çok fazla giriş denemesi, lütfen 15 dakika sonra tekrar deneyin.' },
});

module.exports = { apiLimiter, authLimiter };
