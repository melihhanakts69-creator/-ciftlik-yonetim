const { body, validationResult } = require('express-validator');

// Validation hatalarını kontrol et
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg,  // İlk hata mesajını göster
            errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        });
    }
    next();
};

// Register validation — role-agnostic (isletmeAdi opsiyonel)
const registerValidation = [
    body('isim').trim().isLength({ min: 2 }).withMessage('İsim en az 2 karakter olmalı'),
    body('email').trim().isEmail().withMessage('Geçerli bir email adresi giriniz'),
    body('sifre').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
    body('rol').optional().isIn(['ciftci', 'veteriner', 'sutcu', 'toplayici']).withMessage('Geçersiz rol'),
    // isletmeAdi, lisansNo, firmaAdi vs. role göre opsiyonel — backend kontrolünde
    validate
];

// Login validation
const loginValidation = [
    body('email').trim().isEmail().withMessage('Geçerli bir email adresi giriniz'),
    body('sifre').notEmpty().withMessage('Şifre boş olamaz'),
    body('rol').optional().isIn(['ciftci', 'veteriner', 'sutcu', 'toplayici']).withMessage('Geçersiz rol'),
    validate
];

// Profile update validation
const updateValidation = [
    body('isim').optional().trim().isLength({ min: 2 }).withMessage('İsim en az 2 karakter olmalı'),
    body('email').optional().trim().isEmail().normalizeEmail().withMessage('Geçerli bir email giriniz'),
    body('yeniSifre').optional().isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalı'),
    validate
];

module.exports = { registerValidation, loginValidation, updateValidation };
