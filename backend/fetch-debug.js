const fetch = require('node-fetch');

// API endpoint URL'si (tarayıcınızda veya postmanda test etmek için canlı ortam)
const API_URL = 'https://ciftlik-backend.onrender.com/api';

async function testWorkerDashboard() {
    try {
        // 1. Önce giriş yapmayı deneyelim - Kullanıcı şifresi veya örnek bir sütçü girişi?
        // Kullanıcının sistemdeki epostasını bilmediğim için, sunucuya dışarıdan hata verdirecek public bir test API'si yoksa
        // Login denemek yerine Auth içerisinden sub-account rotasını kurcalayabiliriz.
        console.log("Sunucu erişim testi:");
        const res = await fetch(`${API_URL}/auth/me`);
        const status = res.status;
        console.log("Auth me status (No token):", status); // 401 dönmeli

    } catch (err) {
        console.error("Fetch Hatası: ", err);
    }
}

testWorkerDashboard();
