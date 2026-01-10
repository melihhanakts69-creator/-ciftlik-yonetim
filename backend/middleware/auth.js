const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Header'dan token al
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Giriş yapmalısınız!' });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Geçersiz token!' });
  }
};