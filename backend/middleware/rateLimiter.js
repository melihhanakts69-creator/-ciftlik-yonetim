const rateLimit = require('express-rate-limit');

// Genel API limiter: 15 dakikada 500 istek (tek sayfa ~5-10 istek yapıyor)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { message: 'Çok fazla istek gönderildi, lütfen biraz bekleyip tekrar deneyin.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Auth limiter: Login/Register brute-force koruması — 15 dakikada 20 deneme
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Çok fazla giriş denemesi, lütfen 15 dakika sonra tekrar deneyin.' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { apiLimiter, authLimiter };
