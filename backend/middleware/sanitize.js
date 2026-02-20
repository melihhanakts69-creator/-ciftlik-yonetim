/**
 * Custom MongoDB Sanitization Middleware
 * express-mongo-sanitize v2 Express 5 ile uyumsuz olduğu için
 * kendi NoSQL injection korumasını yazıyoruz.
 * 
 * $ ve . ile başlayan key'leri temizler, MongoDB operatörlerini engeller.
 */

const sanitizeValue = (val) => {
    if (val === null || val === undefined) return val;

    if (typeof val === 'string') {
        return val;
    }

    if (Array.isArray(val)) {
        return val.map(sanitizeValue);
    }

    if (typeof val === 'object') {
        return sanitizeObject(val);
    }

    return val;
};

const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const clean = {};
    for (const key of Object.keys(obj)) {
        // $ ile başlayan key'ler MongoDB operatörleridir — engelle
        if (key.startsWith('$')) continue;
        // . içeren key'ler nested field erişimi — engelle
        if (key.includes('.')) continue;

        clean[key] = sanitizeValue(obj[key]);
    }
    return clean;
};

const mongoSanitize = (req, res, next) => {
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);
    next();
};

module.exports = mongoSanitize;
