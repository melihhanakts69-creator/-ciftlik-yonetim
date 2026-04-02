const rateLimit = require('express-rate-limit');

// CORS preflight ve sağlık kontrolleri kotaya girmesin (yanlışlıkla login kilitlenmesin)
const skipLight = (req) => req.method === 'OPTIONS';

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
    skip: skipLight,
    message: { message: 'Çok fazla istek gönderildi, lütfen biraz bekleyip tekrar deneyin.' },
});

// Sadece /api/auth — login/register brute-force; genel /api limitiyle çift sayım olmasın diye server'da auth yolu genel limiter dışı
const authLimiter = rateLimit({
    ...limiterDefaults,
    windowMs: 15 * 60 * 1000,
    max: 80,
    skip: skipLight,
    message: { message: 'Çok fazla giriş denemesi, lütfen 15 dakika sonra tekrar deneyin.' },
});

module.exports = { apiLimiter, authLimiter };
