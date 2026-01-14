const fetch = require('node-fetch'); // Node.js environment için (v18+ native fetch destekler ama garanti olsun diye)

// Eğer node-fetch yoksa native fetch kullan (Node 18+)
// const fetch = global.fetch; 

const API_URL = 'http://localhost:5000/api';

async function testDashboard() {
  try {
    console.log('--- TEST BAŞLIYOR ---');

    // 1. Rastgele bir kullanıcı ile Kayıt Ol ve Token Al
    const randomEmail = `test_${Date.now()}@example.com`;
    const userPayload = {
      isim: 'Test User',
      email: randomEmail,
      sifre: '123456',
      isletmeAdi: 'Test Ciftligi'
    };

    console.log(`1. Kullanıcı oluşturuluyor: ${randomEmail}`);
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload)
    });

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      // Eğer zaten kayıtlıysa login deneyelim
      console.log('Kayıt başarısız, login deneniyor...');
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userPayload.email, sifre: userPayload.sifre })
      });
      // Login cevabını işle... (burayı şimdilik geçiyorum, yeni mail ile kayıt garantili)
      throw new Error(`Register failed: ${JSON.stringify(registerData)}`);
    }

    const token = registerData.token;
    console.log('✅ Token alındı.');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Dashboard Endpointlerini Test Et
    const endpoints = [
      '/dashboard/ping', // <-- YENİ EKLENDİ
      '/dashboard/stats',
      '/dashboard/performans/sut?gun=30',
      '/dashboard/yapilacaklar',
      '/dashboard/aktiviteler?limit=10'
    ];

    for (const endpoint of endpoints) {
      console.log(`\nTESTING: ${endpoint}...`);
      const res = await fetch(`${API_URL}${endpoint}`, { headers });

      const data = await res.text(); // Önce text olarak al, JSON parse hatasını görelim

      if (res.ok) {
        console.log(`✅ ${endpoint} SUCCESS`);
        // console.log(data);
      } else {
        console.error(`❌ ${endpoint} FAILED (${res.status})`);
        console.error('Error Body:', data);
      }
    }

  } catch (error) {
    console.error('\n💥 CRITICAL SCRIPT ERROR:', error);
  }
}

testDashboard();
