const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Header'dan token al
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Giriş yapmalısınız!' });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Veritabanından kullanıcıyı bul
    const user = await User.findById(decoded.userId).select('parentUserId rol _id');
    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı, oturumunuz geçersiz!' });
    }

    // Alt hesap (sub-account) kontrolü:
    // Eğer kullanıcının bir ana hesabı (parentUserId) varsa, veri işlemleri ana hesap üzerinden yapılsın diye req.userId = parentUserId olacak
    req.userId = user.parentUserId ? user.parentUserId.toString() : user._id.toString();

    // Daha spesifik işlemler veya rol yetkilendirmesi gerekbilmesi için req e user ekleniyor
    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token süresi doldu!' });
    }
    res.status(401).json({ message: 'Geçersiz token!' });
  }
};