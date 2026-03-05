const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // 1. Kullanıcı objesi veya rolü yoksa engelle
        if (!req.user || !req.user.rol) {
            return res.status(401).json({ message: 'Erişim engellendi: Rol bilgisi bulunamadı.' });
        }

        // 2. 'ciftci' (Ana Yönetici / Patron) her API'ye tam erişime sahiptir.
        if (req.user.rol === 'ciftci') {
            return next();
        }

        // 3. Kullanıcının rolü, bu API için izin verilen rollerden biriyse geçişe izin ver
        if (allowedRoles.includes(req.user.rol)) {
            return next();
        }

        // 4. Yetki yoksa 403 Forbidden (Yasaklandı) hatası dön
        return res.status(403).json({
            message: 'Güvenlik Uyarısı: Bu işlemi yapmak için yetkiniz (profiliniz) uygun değil.'
        });
    };
};

module.exports = checkRole;
