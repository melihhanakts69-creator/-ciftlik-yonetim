/**
 * geminiVision.js — AI Fallback
 * Sadece taranmış görsel veya okunaksız PDF için devreye girer.
 * Mevcut ai.js'teki API key sistemini tekrar kullanır.
 */

const https = require('https');

const GEMINI_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(Boolean);

const VISION_MODEL = 'gemini-2.5-flash'; // Multimodal destekler

const IMPORT_PROMPT = `Sana bir çiftlik / Türkvet hayvan listesi görseli veya PDF sayfası gönderiyorum.
İçindeki tabloda veya listede aşağıdaki bilgileri bul:
- Küpe No (ear_tag): "TR" ile başlayan numara
- Irk (breed): Simental, Holstein, Montofon, Esmer, Jersey, Angus vb.
- Cinsiyet (gender): "inek", "boga" veya "buzagi" değerlerinden birini kullan
- Doğum Tarihi (birth_date): YYYY-MM-DD formatında

KRİTİK KURALLAR:
1. SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
[{"ear_tag":"TR12345","breed":"Simental","gender":"inek","birth_date":"2022-05-01"}]
2. TC Kimlik No, İşletme No, adres, telefon gibi kişisel verileri JSON'a ASLA ekleme ve unut.
3. Küpe no yoksa o satırı ekleme.
4. Okuyamadığın alan için boş string ("") kullan.`;

async function analyzeWithGemini(base64Data, mimeType) {
  if (GEMINI_KEYS.length === 0) {
    throw new Error('Gemini API anahtarı tanımlanmamış');
  }

  const apiKey = GEMINI_KEYS[0];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${VISION_MODEL}:generateContent?key=${apiKey}`;

  const body = JSON.stringify({
    contents: [{
      role: 'user',
      parts: [
        { text: IMPORT_PROMPT },
        { inline_data: { mime_type: mimeType, data: base64Data } }
      ]
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
  });

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
            return reject(new Error(parsed.error.message || 'Gemini Vision hatası'));
          }
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';

          // JSON parse
          const jsonMatch = text.match(/\[[\s\S]*\]/);
          if (!jsonMatch) {
            return reject(new Error('Gemini geçerli JSON döndürmedi'));
          }
          const items = JSON.parse(jsonMatch[0]);
          resolve({ items, source: 'gemini' });
        } catch (e) {
          reject(new Error('Gemini yanıtı parse edilemedi: ' + e.message));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(45000, () => { req.destroy(); reject(new Error('Gemini zaman aşımı')); });
    req.write(body);
    req.end();
  });
}

module.exports = { analyzeWithGemini };
