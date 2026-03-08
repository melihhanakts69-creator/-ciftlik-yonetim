const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.rol) {
            return res.status(401).json({ message: 'Erişim engellendi: Rol bilgisi bulunamadı.' });
        }

        const userRol = req.user.rol;

        // İşçi (sutcu) çiftçi verilerine erişebilir: sutcu → ciftci yetkisini devralır
        if (userRol === 'sutcu' && allowedRoles.includes('ciftci')) {
            return next();
        }

        // Kullanıcının rolü izin verilenlerden biriyse geçiş
        if (allowedRoles.includes(userRol)) {
            return next();
        }

        return res.status(403).json({
            message: 'Güvenlik Uyarısı: Bu işlemi yapmak için yetkiniz (profiliniz) uygun değil.'
        });
    };
};

module.exports = checkRole;
