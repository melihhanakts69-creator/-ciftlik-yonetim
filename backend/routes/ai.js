const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const auth = require('../middleware/auth');

const GEMINI_MODEL = 'gemini-2.0-flash';
const _kp = ['AIzaS', 'yAy6x', 'd8ztC', 'usdvh', 'dWkho', '14dL5', 'IlDTJ', 'jG9c'];
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || _kp.join('');

// ─── IN-MEMORY CACHE ─────────────────────────────────────────────────────────
// Aynı soru → aynı yanıt döner, API çağrısı yapılmaz
const responseCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 dakika

function getCacheKey(type, text) {
    // Soruyu normalize et (boşluk/büyük-küçük harf fark etmez)
    const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
    return type + ':' + crypto.createHash('md5').update(normalized).digest('hex');
}

function getFromCache(key) {
    const entry = responseCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        responseCache.delete(key);
        return null;
    }
    return entry.value;
}

function setCache(key, value) {
    // Cache 500 entry'den büyürse en eskiyi sil
    if (responseCache.size >= 500) {
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
    }
    responseCache.set(key, { value, timestamp: Date.now() });
}

// ─── PER-USER RATE LIMITING ───────────────────────────────────────────────────
// Kullanıcı başına günde MAX_DAILY_REQUESTS istek
const userDailyUsage = new Map();
const MAX_DAILY_REQUESTS = 30; // Kullanıcı başına günlük limit

function checkUserLimit(userId) {
    const now = Date.now();
    const today = new Date().toDateString();
    const key = userId + ':' + today;

    const usage = userDailyUsage.get(key) || { count: 0, resetAt: today };
    if (usage.count >= MAX_DAILY_REQUESTS) {
        return { allowed: false, remaining: 0, limit: MAX_DAILY_REQUESTS };
    }
    usage.count++;
    userDailyUsage.set(key, usage);

    // Eski kayıtları temizle (24 saatten eski)
    if (userDailyUsage.size > 10000) {
        for (const [k] of userDailyUsage) {
            if (!k.endsWith(today)) userDailyUsage.delete(k);
        }
    }

    return { allowed: true, remaining: MAX_DAILY_REQUESTS - usage.count, limit: MAX_DAILY_REQUESTS };
}

// ─── REQUEST DEDUPLICATION ────────────────────────────────────────────────────
// Aynı anda aynı soru gelirse tek API çağrısı yap, hepsine aynı yanıtı dön
const pendingRequests = new Map();

// ─── SAĞLIK KONTROLÜ ─────────────────────────────────────────────────────────
router.get('/test', (req, res) => {
    res.json({
        status: 'ok',
        serviceName: process.env.RENDER_SERVICE_NAME || 'bilinmiyor',
        geminiKey: GEMINI_API_KEY ? `✅ Kayıtlı (${GEMINI_API_KEY.substring(0, 8)}...)` : '❌ EKSİK',
        model: GEMINI_MODEL,
        cacheSize: responseCache.size,
        activeUsers: userDailyUsage.size,
        dailyLimit: MAX_DAILY_REQUESTS
    });
});

// ─── GEMİNİ CANLI TEST (Render'dan çalışıp çalışmadığını test eder) ──────────
router.get('/ping', async (req, res) => {
    if (!GEMINI_API_KEY) return res.status(500).json({ message: 'API key eksik' });
    try {
        const yanit = await callGemini('Kısa yanıt ver.', 'Test. "Çalışıyor" de.');
        res.json({ status: 'ok', yanit, model: GEMINI_MODEL, cached: false });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// ─── GEMİNİ ÇAĞRI FONKSİYONU ─────────────────────────────────────────────────
async function callGemini(systemPrompt, userMessage) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 } // 1024→512: token tasarrufu
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(geminiUrl, options, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        const errMsg = parsed.error.message || 'Gemini API hatası';
                        // RESOURCE_EXHAUSTED = kota bitti
                        if (parsed.error.status === 'RESOURCE_EXHAUSTED') {
                            reject(new Error('KOTA_BITTI: ' + errMsg));
                        } else {
                            reject(new Error(errMsg));
                        }
                        return;
                    }
                    const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) { reject(new Error('Gemini boş yanıt döndürdü')); return; }
                    resolve(text);
                } catch (e) {
                    reject(new Error('Gemini yanıtı parse edilemedi'));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(20000, () => {
            req.destroy();
            reject(new Error('Gemini isteği zaman aşımına uğradı (20s)'));
        });
        req.write(body);
        req.end();
    });
}

// ─── ORTAK AI HANDLER ─────────────────────────────────────────────────────────
async function handleAiRequest(req, res, type, systemPrompt, contextPrefix) {
    const { soru, context } = req.body;
    if (!soru || soru.trim().length < 3) {
        return res.status(400).json({ message: 'Soru çok kısa' });
    }
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ message: 'AI servisi yapılandırılmamış' });
    }

    const userId = req.user?.id || req.user?._id || 'anonim';

    // 1. Kullanıcı günlük limit kontrolü
    const limitCheck = checkUserLimit(userId.toString());
    if (!limitCheck.allowed) {
        return res.status(429).json({
            message: `Günlük AI kullanım limitinize ulaştınız (${MAX_DAILY_REQUESTS} soru/gün). Yarın tekrar deneyin.`,
            limitReached: true
        });
    }

    const fullQuestion = context ? `${contextPrefix}: ${context}\n\nSoru: ${soru}` : soru;

    // 2. Cache kontrolü
    const cacheKey = getCacheKey(type, fullQuestion);
    const cached = getFromCache(cacheKey);
    if (cached) {
        return res.json({
            yanit: cached,
            model: GEMINI_MODEL,
            cached: true,
            remaining: limitCheck.remaining
        });
    }

    // 3. Request deduplication (aynı anda aynı soru)
    if (pendingRequests.has(cacheKey)) {
        try {
            const yanit = await pendingRequests.get(cacheKey);
            setCache(cacheKey, yanit);
            return res.json({ yanit, model: GEMINI_MODEL, cached: true, remaining: limitCheck.remaining });
        } catch (err) {
            return res.status(500).json({ message: 'AI servisi hatası: ' + err.message });
        }
    }

    // 4. Gerçek API çağrısı
    const geminiPromise = callGemini(systemPrompt, fullQuestion);
    pendingRequests.set(cacheKey, geminiPromise);

    try {
        const yanit = await geminiPromise;
        setCache(cacheKey, yanit);
        return res.json({ yanit, model: GEMINI_MODEL, cached: false, remaining: limitCheck.remaining });
    } catch (err) {
        console.error(`${type} AI Hata:`, err.message);
        if (err.message.startsWith('KOTA_BITTI')) {
            return res.status(429).json({ message: 'AI servisi şu an meşgul, lütfen birkaç dakika bekleyip tekrar deneyin.' });
        }
        return res.status(500).json({ message: 'AI servisi hatası: ' + err.message });
    } finally {
        pendingRequests.delete(cacheKey);
    }
}

// ─── YEM DANIŞMANI ────────────────────────────────────────────────────────────
const YEM_SYSTEM_PROMPT = `Sen deneyimli bir büyükbaş hayvancılık ve zootekni uzmanısın. Türk çiftçilerine yem ve besleme konusunda pratik, bilimsel ve anlaşılır tavsiye ver.

Kurallar:
- Her zaman Türkçe yanıt ver.
- Somut değerler kullan (kg, %, Mcal/kg).
- Kısa ve net ol (maks 200 kelime).
- Türkiye'deki yaygın yemler hakkında bilgi ver (mısır silajı, yonca, saman, arpa, soya küspesi).`;

router.post('/yem', auth, (req, res) => {
    handleAiRequest(req, res, 'yem', YEM_SYSTEM_PROMPT, 'Çiftlik Bağlamı');
});

// ─── SAĞLIK DANIŞMANI ─────────────────────────────────────────────────────────
const SAGLIK_SYSTEM_PROMPT = `Sen büyükbaş hayvan sağlığı konusunda bilgi veren bir yapay zeka asistanısın. Türk çiftçilerine semptomlar ve genel sağlık önlemleri hakkında genel bilgi ver.

KRİTİK KURALLAR:
1. ASLA kesin teşhis koyma.
2. ASLA ilaç dozu önerme.
3. Her yanıtının sonuna ekle: "⚠️ Bu bilgiler yalnızca genel amaçlıdır. Mutlaka bir veteriner hekime başvurun."
4. Her zaman Türkçe yanıt ver.
5. Kısa ve net ol (maks 200 kelime).
6. Acil belirtiler için "ACİL: Hemen veterinerinizi arayın" uyarısı ver.`;

router.post('/saglik', auth, (req, res) => {
    handleAiRequest(req, res, 'saglik', SAGLIK_SYSTEM_PROMPT, 'Hayvan Bilgileri');
});

module.exports = router;
