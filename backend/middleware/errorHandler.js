// Global Error Handler — production'da error detaylarını gizler
const errorHandler = (err, req, res, next) => {
    console.error('❌ Sunucu hatası:', err.stack || err.message);

    const statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === 'production') {
        res.status(statusCode).json({
            message: statusCode === 500 ? 'Sunucu hatası' : err.message
        });
    } else {
        res.status(statusCode).json({
            message: err.message || 'Sunucu hatası',
            error: err.stack
        });
    }
};

module.exports = errorHandler;
