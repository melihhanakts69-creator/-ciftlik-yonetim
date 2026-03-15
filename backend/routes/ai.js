const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const AiSohbet = require('../models/AiSohbet'); // Yeni Sohbet Modeli eklendi

const GEMINI_MODEL = 'gemini-2.5-flash';

const MAX_DAILY_REQUESTS = 20;
const userLimits = new Map();

function checkUserLimit(userId) {
  const bugun = new Date().toISOString().split('T')[0];
  const kayit = userLimits.get(userId);

  if (!kayit || kayit.date !== bugun) {
    userLimits.set(userId, { count: 1, date: bugun });
    return { allowed: true, remaining: MAX_DAILY_REQUESTS - 1 };
  }

  if (kayit.count >= MAX_DAILY_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  kayit.count++;
  return { allowed: true, remaining: MAX_DAILY_REQUESTS - kayit.count };
}

// ─── API KEY ROTATION SISTEMI ─────────────────────────────────────────────────
// Bu sistem birden fazla API anahtarını destekler. Biri bitince diğerine atlar.
// ─── API KEY YAPILANDIRMASI ──────────────────────────────────────────────────
const GEMINI_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(k => k.length > 0);

const CLAUDE_KEYS = (process.env.CLAUDE_API_KEYS || process.env.CLAUDE_API_KEY || '')
    .split(',').map(k => k.trim()).filter(k => k.length > 0);

let currentGeminiIndex = 0;
let currentClaudeIndex = 0;

console.log(`🤖 AI Sistemi Başlatıldı. Gemini: ${GEMINI_KEYS.length}, Claude: ${CLAUDE_KEYS.length}`);

// ─── API ÇAĞRI FONKSİYONLARI ──────────────────────────────────────────────────

async function callClaude(systemPrompt, userMessage, apiKey, history = []) {
    const body = JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
            ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
            { role: "user", content: userMessage }
        ]
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        if (res.statusCode === 429) reject(new Error('KOTA_BITTI: Claude limit doldu'));
                        else reject(new Error(parsed.error.message || 'Claude API Hatası'));
                        return;
                    }
                    resolve(parsed.content[0].text);
                } catch (e) { reject(new Error('Claude yanıtı parse edilemedi')); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function callGeminiSingle(systemPrompt, userMessage, apiKey, history = []) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    return new Promise((resolve, reject) => {
        const contents = history.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));
        contents.push({ role: 'user', parts: [{ text: userMessage }] });

        const body = JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: contents,
            generationConfig: { temperature: 0.7 }
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
                        if (parsed.error.status === 'RESOURCE_EXHAUSTED' || parsed.error.code === 429) {
                            reject(new Error('KOTA_BITTI: Gemini limit doldu'));
                        } else {
                            reject(new Error(parsed.error.message || 'Gemini API hatası'));
                        }
                        return;
                    }
                    const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) { reject(new Error('Gemini boş yanıt döndürdü')); return; }
                    resolve(text);
                } catch (e) { reject(new Error('Gemini yanıtı parse edilemedi')); }
            });
        });
        req.on('error', reject);
        req.setTimeout(15000, () => { req.destroy(); reject(new Error('KOTA_BITTI: Zaman aşımı')); });
        req.write(body);
        req.end();
    });
}

async function callAiWithRetry(systemPrompt, userMessage, history = []) {
    // 1. ÖNCE CLAUDE DENE (Kullanıcı Claude istiyor)
    for (let i = 0; i < CLAUDE_KEYS.length; i++) {
        const idx = (currentClaudeIndex + i) % CLAUDE_KEYS.length;
        try {
            const res = await callClaude(systemPrompt, userMessage, CLAUDE_KEYS[idx], history);
            currentClaudeIndex = idx;
            return res;
        } catch (err) {
            if (!err.message.startsWith('KOTA_BITTI')) throw err;
            console.warn(`[AI] Claude Key ${idx} kota bitti.`);
        }
    }

    // 2. Claude bittiyse YEDEK OLARAK Gemini dene
    console.log("[AI] Claude kotaları doldu, Gemini'ye (yedek) geçiliyor...");
    for (let i = 0; i < GEMINI_KEYS.length; i++) {
        const idx = (currentGeminiIndex + i) % GEMINI_KEYS.length;
        try {
            const res = await callGeminiSingle(systemPrompt, userMessage, GEMINI_KEYS[idx], history);
            currentGeminiIndex = idx;
            return res;
        } catch (err) {
            if (!err.message.startsWith('KOTA_BITTI')) throw err;
            console.warn(`[AI] Gemini Key ${idx} kota bitti.`);
        }
    }

    throw new Error('KOTA_BITTI: Mevcut tüm API anahtarlarının (Claude & Gemini) kotası doldu.');
}

// ─── ORTAK AI HANDLER (DİNAMİK GEÇMİŞ İLE EKLENDİ) ────────────────────────
async function handleAiRequest(req, res, type, systemPrompt, contextPrefix) {
    const { soru, context, chatId } = req.body;
    if (!soru || soru.trim().length < 3) {
        return res.status(400).json({ message: 'Soru çok kısa' });
    }
    if (GEMINI_KEYS.length === 0 && CLAUDE_KEYS.length === 0) {
        return res.status(500).json({ message: 'AI servisi yapılandırılmamış' });
    }

    const userId = req.userId || 'anonim';
    const limitCheck = checkUserLimit(userId.toString());
    if (!limitCheck.allowed) {
        return res.status(429).json({
            message: `Günlük AI kullanım limitinize ulaştınız (${MAX_DAILY_REQUESTS} soru/gün). Yarın tekrar deneyin.`,
            limitReached: true
        });
    }

    const fullQuestion = context ? `${contextPrefix}: ${context}\n\nSoru: ${soru}` : soru;

    // Veritabanından geçmişi çek 
    let chatHistory = [];
    let chatDoc = null;
    if (chatId && userId !== 'anonim') {
        try {
            chatDoc = await AiSohbet.findOne({ _id: chatId, user: userId });
            if (chatDoc) {
                // Geçmişteki son 10 mesajı al (Token tasarrufu için tüm geçmiş yerine en yakın bağlam)
                const limitHistory = chatDoc.messages.slice(-10);
                chatHistory = limitHistory.map(m => ({ role: m.role, text: m.text }));
            }
        } catch (e) {
            console.error('Sohbet geçmişi çekme hatası:', e);
        }
    }

    // Gerçek API Çağrısı Başlar (Claude Öncelikli)
    const aiPromise = callAiWithRetry(systemPrompt, fullQuestion, chatHistory);

    try {
        const yanit = await aiPromise;

        // --- Veritabanı Kayıt İşlemi ---
        if (userId !== 'anonim') {
            try {
                if (!chatDoc) {
                    // Yeni Sohbet oluştur (Başlık olarak ilk sorunun başı)
                    let title = soru.substring(0, 30);
                    if (soru.length > 30) title += '...';

                    chatDoc = new AiSohbet({
                        user: userId,
                        title: title,
                        type: type,
                        messages: []
                    });
                }

                // Mesajları dökümana ekle
                chatDoc.messages.push({ role: 'user', text: soru });
                chatDoc.messages.push({ role: 'model', text: yanit });
                await chatDoc.save();
            } catch (dbErr) {
                console.error("Sohbet DB'ye kaydedilemedi:", dbErr);
            }
        }

        return res.json({
            yanit,
            model: GEMINI_MODEL,
            cached: false,
            remaining: limitCheck.remaining,
            chatId: chatDoc ? chatDoc._id : null
        });
    } catch (err) {
        console.error(`${type} AI Hata:`, err.message);
        if (err.message.startsWith('KOTA_BITTI')) {
            return res.status(429).json({ message: 'Mevcut tüm AI sistemlerinin kotası anlık olarak dolu, birkaç dakika bekleyip tekrar deneyin.' });
        }
        return res.status(500).json({ message: 'AI servisi hatası: ' + err.message });
    }
}

// ─── GEÇMİŞ MESAJLARI VE SOHBETLERİ GETİRME ENDPOINTLERİ ───────────────────
router.get('/history', auth, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        const userId = req.userId;
        const chats = await AiSohbet.find({ user: userId })
            .select('_id title type updatedAt')
            .sort({ updatedAt: -1 });
        res.json(chats);
    } catch (e) {
        res.status(500).json({ message: 'Geçmiş alınırken hata' });
    }
});

router.get('/history/:id', auth, async (req, res) => {
    try {
        const userId = req.userId;
        const chat = await AiSohbet.findOne({ _id: req.params.id, user: userId });
        if (!chat) return res.status(404).json({ message: 'Sohbet bulunamadı' });
        res.json(chat);
    } catch (e) {
        res.status(500).json({ message: 'Sohbet detayları alınırken hata' });
    }
});


// ─── YEM DANIŞMANI ────────────────────────────────────────────────────────────
const YEM_SYSTEM_PROMPT = `Sen deneyimli bir büyükbaş hayvancılık ve zootekni uzmanısın. Türk çiftçilerine yem ve besleme konusunda pratik, bilimsel ve anlaşılır tavsiye ver.

Kurallar:
- Her zaman Türkçe yanıt ver.
- Somut değerler kullan (kg, %, Mcal/kg).
- Cümlelerini asla yarım bırakma. Net, tamamlanmış ve akıcı cümleler kur.
- Çok uzun laf kalabalığından kaçın ama asla bir fikri veya cümleyi yarım bırakma. 
- Türkiye'deki yaygın yemler hakkında bilgi ver (mısır silajı, yonca, saman, vb.).`;

router.post('/yem', auth, (req, res) => {
    handleAiRequest(req, res, 'yem', YEM_SYSTEM_PROMPT, 'Çiftlik Bağlamı');
});

// ─── SAĞLIK DANIŞMANI ─────────────────────────────────────────────────────────
const SAGLIK_SYSTEM_PROMPT = `Sen büyükbaş hayvan sağlığı konusunda bilgi veren bir yapay zeka asistanısın. Türk çiftçilerine semptomlar ve genel sağlık önlemleri hakkında genel bilgi ver.

KRİTİK KURALLAR:
1. ASLA kesin teşhis koyma.
2. ASLA ilaç dozu önerme.
3. Her yanıtının sonuna tam olarak şu cümleyi ekle ve cümleni asla yarım bırakma: "⚠️ Bu bilgiler yalnızca genel amaçlıdır. Mutlaka bir veteriner hekime başvurun."
4. Her zaman Türkçe yanıt ver.
5. Cümlelerini asla yarım bırakma, paragrafları tam kapat. Öz ama açıklayıcı ol.
6. Acil belirtiler için "ACİL: Hemen veterinerinizi arayın" uyarısı ver.`;

router.post('/saglik', auth, (req, res) => {
    handleAiRequest(req, res, 'saglik', SAGLIK_SYSTEM_PROMPT, 'Hayvan Bilgileri');
});

module.exports = router;
