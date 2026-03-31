const User = require('../models/User');

function parseAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * auth middleware'inden sonra kullanın. ADMIN_EMAILS (virgülle ayrılmış e-postalar) ile eşleşen kullanıcılar.
 * Production'da ADMIN_EMAILS boşsa istek reddedilir. Development'ta boşken uyarı ile tüm giriş yapmış kullanıcı kabul edilir.
 */
async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Giriş yapmalısınız.' });
  }
  const allowed = parseAdminEmails();
  if (allowed.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({
        message:
          'Admin paneli yapılandırılmamış. Sunucuda ADMIN_EMAILS ortam değişkenini tanımlayın (örn: admin@siteniz.com).',
      });
    }
    console.warn(
      '[admin] ADMIN_EMAILS boş — geliştirme modunda giriş yapmış her kullanıcı admin kabul ediliyor.'
    );
    return next();
  }
  try {
    const u = await User.findById(req.originalUserId).select('email').lean();
    const email = (u?.email || '').toLowerCase();
    if (!email || !allowed.includes(email)) {
      return res.status(403).json({ message: 'Bu işlem için yönetici yetkisi gerekir.' });
    }
    next();
  } catch (err) {
    console.error('[adminAuth]', err);
    return res.status(500).json({ message: 'Yetki kontrolü başarısız.' });
  }
}

module.exports = { requireAdmin };
