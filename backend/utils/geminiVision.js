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
- Küpe No (ear_tag): "TR" ile başlayan veya çiftliğe özel numara
- Hayvan Adı (name): Hayvana verilen isim (yoksa boş bırak)
- Irk (breed): Simental, Holstein, Montofon, Esmer, Jersey, Angus, Limouzin vb.
- Cinsiyet (gender): "disi" veya "erkek" değerinden birini kullan
- Doğum Tarihi (birth_date): YYYY-MM-DD formatında
- Kilo (weight): Sayı olarak kg cinsinden
- Anne Küpe No (anne_kupe_no): Annenin küpe numarası (varsa)
- Baba Küpe No (baba_kupe_no): Babanın veya boğanın küpe/semen kodu (varsa)
- Doğum Yeri (dogum_yeri): İşletme adı veya il/ilçe
- Hayvan Tipi (hayvan_tipi): "inek", "duve", "buzagi" veya "tosun" olarak belirt (yaşa/cinsiyete göre tahmin et)

KRİTİK KURALLAR:
1. SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
[{"ear_tag":"TR12345","name":"","breed":"Simental","gender":"disi","birth_date":"2022-05-01","weight":0,"anne_kupe_no":"","baba_kupe_no":"","dogum_yeri":"","hayvan_tipi":"inek"}]
2. TC Kimlik No, sahip adı-soyadı, telefon, adres gibi kişisel verileri JSON'a ASLA ekleme.
3. Küpe no yoksa o satırı ekleme.
4. Bilinmeyen alanlar için boş string ("") veya 0 kullan.
5. Yaş tahmini: 6 aydan küçük=buzagi, 6-36 ay dişi=duve, 6-36 ay erkek=tosun, 36+ ay=inek`;

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
