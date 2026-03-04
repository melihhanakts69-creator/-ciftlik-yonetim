const express = require('express');
const router = express.Router();
const https = require('https');
const auth = require('../middleware/auth');

const GEMINI_MODEL = 'gemini-2.0-flash';

// Sağlık kontrolü — tarayıcıdan test et: /api/ai/test
router.get('/test', (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    res.json({
        status: 'ok',
        message: 'AI route calisıyor ✅',
        geminiKey: key ? `✅ Kayıtlı (${key.substring(0, 8)}...)` : '❌ EKSİK',
        allEnvKeys: Object.keys(process.env).filter(k => !k.startsWith('npm_') && !k.startsWith('NVM_')),
        model: GEMINI_MODEL
    });
});


/**
 * Gemini API'yi çağıran yardımcı fonksiyon
 */
async function callGemini(systemPrompt, userMessage) {
    const apiKey = process.env.GEMINI_API_KEY;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: [
                {
                    role: 'user',
                    parts: [{ text: userMessage }]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            }
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(geminiUrl, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        reject(new Error(parsed.error.message || 'Gemini API hatası'));
                        return;
                    }
                    const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) {
                        reject(new Error('Gemini boş yanıt döndürdü'));
                        return;
                    }
                    resolve(text);
                } catch (e) {
                    reject(new Error('Gemini yanıtı parse edilemedi'));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// ─── YEM DANIŞMANI ───────────────────────────────────────────────────────────
const YEM_SYSTEM_PROMPT = `Sen deneyimli bir büyükbaş hayvancılık ve zootekni uzmanısın. Görevin, Türk çiftçilerine yem ve besleme konusunda pratik, bilimsel ve anlaşılır tavsiyet vermektir.

Kurallar:
- Her zaman Türkçe yanıt ver.
- Yanıtlarında somut değerler kullan (kg, %, Mcal/kg gibi birimlerle).
- Cevapların kısa ve net olsun (maksimum 300 kelime).
- Gerektiğinde madde madde listele.
- Mevcut yem stoku ve rasyon hesaplaması gibi pratik konularda yardımcı ol.
- Türkiye'deki yaygın yem çeşitleri (mısır silajı, yonca, saman, arpa, soya küspesi vb.) hakkında bilgi ver.`;

router.post('/yem', auth, async (req, res) => {
    try {
        const { soru, context } = req.body;

        if (!soru || soru.trim().length < 3) {
            return res.status(400).json({ message: 'Soru çok kısa' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'AI servisi yapılandırılmamış. Render ortam değişkenlerini kontrol edin.' });
        }

        // Ek context varsa (hayvan grubu, mevcut yemler vb.) soruya ekle
        const fullQuestion = context
            ? `Çiftlik Bağlamı: ${context}\n\nSoru: ${soru}`
            : soru;

        const yanit = await callGemini(YEM_SYSTEM_PROMPT, fullQuestion);
        res.json({ yanit, model: GEMINI_MODEL });

    } catch (err) {
        console.error('Yem AI Hata:', err.message);
        res.status(500).json({ message: 'AI servisi geçici olarak kullanılamıyor: ' + err.message });
    }
});

// ─── SAĞLIK DANIŞMANI ─────────────────────────────────────────────────────────
const SAGLIK_SYSTEM_PROMPT = `Sen büyükbaş hayvan sağlığı konusunda bilgi veren bir yapay zeka asistanısın. Türk çiftçilerine semptomlar, hastalıklar ve genel sağlık önlemleri hakkında genel bilgi veriyorsun.

KRİTİK KURALLAR:
1. ASLA kesin teşhis koyma.
2. ASLA ilaç dozu önerme.
3. Her yanıtının SONUNA mutlaka şu uyarıyı ekle: "⚠️ Bu bilgiler yalnızca genel amaçlıdır. Hayvanınızın sağlığı için mutlaka bir veteriner hekime başvurun."
4. Her zaman Türkçe yanıt ver.
5. Cevapların kısa ve net olsun (maksimum 300 kelime).
6. Acil belirtiler (yüksek ateş, doğum komplikasyonu, şiddetli ishal vb.) için "ACİL: Hemen veterinerinizi arayın" uyarısı ver.
7. Genel koruyucu önlemler ve aşı takvimleri hakkında bilgi verebilirsin.`;

router.post('/saglik', auth, async (req, res) => {
    try {
        const { soru, context } = req.body;

        if (!soru || soru.trim().length < 3) {
            return res.status(400).json({ message: 'Soru çok kısa' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'AI servisi yapılandırılmamış. Render ortam değişkenlerini kontrol edin.' });
        }

        const fullQuestion = context
            ? `Hayvan Bilgileri: ${context}\n\nBelirtiler/Soru: ${soru}`
            : soru;

        const yanit = await callGemini(SAGLIK_SYSTEM_PROMPT, fullQuestion);
        res.json({ yanit, model: GEMINI_MODEL });

    } catch (err) {
        console.error('Sağlık AI Hata:', err.message);
        res.status(500).json({ message: 'AI servisi geçici olarak kullanılamıyor: ' + err.message });
    }
});

module.exports = router;
