const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const arr = errors.array();
    return res.status(400).json({
      message: arr[0]?.msg || 'Geçersiz istek',
      errors: arr.map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidation = [
  body('isim').isLength({ min: 2 }).withMessage('İsim en az 2 karakter olmalı'),
  body('email').isEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('sifre').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
  body('rol')
    .optional({ checkFalsy: true })
    .isIn(['ciftci', 'veteriner', 'sutcu', 'toplayici'])
    .withMessage('Geçersiz rol'),
  validate,
];

const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email boş olamaz')
    .isEmail()
    .withMessage('Geçerli bir email adresi giriniz'),
  body('sifre').notEmpty().withMessage('Şifre boş olamaz'),
  body('rol')
    .optional({ checkFalsy: true })
    .isIn(['ciftci', 'veteriner', 'sutcu', 'toplayici'])
    .withMessage('Geçersiz rol'),
  validate,
];

const updateValidation = [
  body('isim').optional().isLength({ min: 2 }).withMessage('İsim en az 2 karakter olmalı'),
  body('email').optional().isEmail().withMessage('Geçerli bir email giriniz'),
  body('yeniSifre').optional().isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalı'),
  validate,
];

module.exports = { registerValidation, loginValidation, updateValidation };
