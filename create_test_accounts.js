const https = require('https');

function post(path, data) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const options = {
            hostname: 'ciftlik-yonetim.onrender.com',
            port: 443,
            path,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        };
        const req = https.request(options, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.on('error', reject);
        req.setTimeout(30000, () => { req.destroy(new Error('timeout')); });
        req.write(body);
        req.end();
    });
}

async function main() {
    const accounts = [
        {
            isim: 'Test Ciftci',
            email: 'ciftci@agrolina.test',
            sifre: 'Test1234!',
            rol: 'ciftci',
            isletmeAdi: 'Agrolina Test Ciftligi',
            sehir: 'Konya',
            telefon: '05001234561'
        },
        {
            isim: 'Dr Test Veteriner',
            email: 'veteriner@agrolina.test',
            sifre: 'Test1234!',
            rol: 'veteriner',
            lisansNo: 'VET-TR-12345',
            uzmanlik: 'Buyukbas Hayvanlar',
            klinikAdi: 'Test Veteriner Klinigi',
            sehir: 'Ankara',
            telefon: '05001234562'
        },
        {
            isim: 'Test Sutcu',
            email: 'sutcu@agrolina.test',
            sifre: 'Test1234!',
            rol: 'sutcu',
            firmaAdi: 'Konya Sut Kooperatifi',
            bolge: 'Konya Eregli',
            telefon: '05001234563'
        }
    ];

    for (const acc of accounts) {
        try {
            console.log(`\n Kayit: ${acc.email} (${acc.rol})...`);
            const r = await post('/api/auth/register', acc);
            const parsed = JSON.parse(r.body);
            if (r.status === 201) {
                console.log(`OK - Kayit basarili! rol=${parsed.user?.rol}`);
            } else if (r.status === 400 && parsed.message?.includes('zaten')) {
                console.log(`SKIP - Zaten kayitli: ${parsed.message}`);
            } else {
                console.log(`ERROR ${r.status}: ${r.body}`);
            }
        } catch (e) {
            console.log(`HATA: ${e.message}`);
        }
    }
    console.log('\nTum islemler tamamlandi.');
}

main();
