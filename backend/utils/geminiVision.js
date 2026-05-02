/**
 * geminiVision.js — AI Fallback (v2)
 * Taranmış görsel veya metin çıkarılamayan PDF için devreye girer.
 * Hem görsel hem PDF inline_data olarak Gemini'ye gönderilir.
 */

const https = require('https');

const GEMINI_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',').map(k => k.trim()).filter(Boolean);

// gemini-2.5-flash-preview-04-17 → PDF + görsel multimodal destekler
const VISION_MODEL = 'gemini-2.5-flash-preview-04-17';

const IMPORT_PROMPT = `Sana bir çiftlik / Türkvet hayvan listesi görseli, fotoğraf veya PDF sayfası gönderiyorum.
İçindeki tabloda veya listede aşağıdaki bilgileri bul:
- Küpe No (ear_tag): "TR" ile başlayan veya çiftliğe özel numara (ZORUNLU - yoksa o hayvanı ekleme)
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
5. Yaş tahmini: 6 aydan küçük=buzagi, 6-36 ay dişi=duve, 6-36 ay erkek=tosun, 36+ ay=inek
6. Tüm sayfaları tara, tüm hayvanları listele.
7. Yanıtın başında veya sonunda \`\`\`json veya \`\`\` bloğu kullanma, düz JSON listesi döndür.`;

/**
 * Gemini API'ye istek at
 * @param {string} base64Data - base64 encoded dosya içeriği
 * @param {string} mimeType   - 'image/jpeg' | 'image/png' | 'application/pdf' | 'image/webp'
 */
async function analyzeWithGemini(base64Data, mimeType) {
  if (GEMINI_KEYS.length === 0) {
    throw new Error('Gemini API anahtarı tanımlanmamış (GEMINI_API_KEY)');
  }

  const apiKey = GEMINI_KEYS[0];

  // PDF ise inline_data olarak gönder (Gemini PDF desteği)
  // Görsel ise inline_data olarak gönder
  const normalizedMime = normalizeMime(mimeType);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${VISION_MODEL}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{
      role: 'user',
      parts: [
        { text: IMPORT_PROMPT },
        {
          inline_data: {
            mime_type: normalizedMime,
            data: base64Data
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain'
    }
  };

  const bodyStr = JSON.stringify(requestBody);
  // Buffer.byteLength kullanmak binary-safe (multi-byte char sorununu önler)
  const bodyBuf = Buffer.from(bodyStr, 'utf-8');

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': bodyBuf.length
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        try {
          const data = Buffer.concat(chunks).toString('utf-8');
          const parsed = JSON.parse(data);

          if (parsed.error) {
            const errMsg = parsed.error.message || 'Gemini Vision hatası';
            console.error('[geminiVision] API hatası:', errMsg);
            return reject(new Error(errMsg));
          }

          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          console.log(`[geminiVision] Yanıt uzunluğu: ${text.length} karakter`);

          // JSON çıkar — hem düz liste hem ```json``` blokları için
          const cleaned = text
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

          // İlk [ ... ] bloğunu bul
          const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
          if (!jsonMatch) {
            console.warn('[geminiVision] JSON bulunamadı. Ham yanıt:', text.slice(0, 500));
            // Boş liste yerine hata fırlat ki caller doğru mesaj verebilsin
            return reject(new Error('Gemini geçerli JSON döndürmedi. Dosyada okunabilir hayvan verisi bulunamadı.'));
          }

          let items;
          try {
            items = JSON.parse(jsonMatch[0]);
          } catch (parseErr) {
            return reject(new Error('Gemini JSON parse hatası: ' + parseErr.message));
          }

          if (!Array.isArray(items)) {
            return reject(new Error('Gemini yanıtı dizi formatında değil'));
          }

          console.log(`[geminiVision] ${items.length} hayvan bulundu`);
          resolve({ items, source: 'gemini' });

        } catch (e) {
          reject(new Error('Gemini yanıtı işlenemedi: ' + e.message));
        }
      });
    });

    req.on('error', (err) => {
      console.error('[geminiVision] Bağlantı hatası:', err.message);
      reject(err);
    });

    // PDF büyük olabilir, timeout'u artır
    req.setTimeout(90000, () => {
      req.destroy();
      reject(new Error('Gemini zaman aşımı (90s). Dosya çok büyük veya bağlantı yavaş olabilir.'));
    });

    req.write(bodyBuf);
    req.end();
  });
}

/**
 * MIME tipini Gemini'nin kabul ettiği formata normalize et
 */
function normalizeMime(mimeType) {
  if (!mimeType) return 'image/jpeg';
  if (mimeType === 'application/pdf') return 'application/pdf';
  if (mimeType.startsWith('image/')) return mimeType;
  // Fallback
  return 'image/jpeg';
}

module.exports = { analyzeWithGemini };
