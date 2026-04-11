/**
 * fileParser.js — Hibrit Dosya Okuyucu (v2 — Genişletilmiş Alan Desteği)
 * Excel → xlsx, CSV → papaparse, PDF → pdf-parse + regex
 *
 * Okunan tüm alanlar:
 *   ear_tag, name, breed, gender, birth_date, weight,
 *   anne_kupe_no, baba_kupe_no, dogum_yeri, notlar
 *
 * Auto-tür tespiti (autoType):
 *   Yaş < 6 ay  → 'buzagi'
 *   Yaş 6–36 ay, Dişi → 'duve'
 *   Yaş 6–36 ay, Erkek → 'tosun'
 *   Yaş > 36 ay veya bilinmiyor → 'inek'
 */

const XLSX = require('xlsx');
const Papa = require('papaparse');

// ─── KOLON EŞLEŞTİRME ─────────────────────────────────────────────────────────
const KOLON_MAP = {
  ear_tag:      ['küpe no', 'kupeno', 'ear_tag', 'eartag', 'hayvan no', 'hayvanno', 'hayvan numarası', 'küpe', 'no', 'kimlik no'],
  name:         ['isim', 'ad', 'name', 'hayvan adı', 'hayvanadi', 'hayvanın adı'],
  breed:        ['ırk', 'irkı', 'irk', 'breed', 'ırk adı', 'soy'],
  gender:       ['cinsiyet', 'gender', 'cins', 'sex', 'cinsiyeti'],
  birth_date:   ['doğum tarihi', 'dogum tarihi', 'dogumtarihi', 'birth_date', 'birthdate', 'd.tarihi', 'dogtar', 'doğtar'],
  weight:       ['kilo', 'ağırlık', 'agirlik', 'weight', 'kg', 'canlı ağırlık'],
  anne_kupe_no: ['anne küpe', 'annekupe', 'anne no', 'anneno', 'mother', 'anne küpe no', 'anne hayvan no'],
  baba_kupe_no: ['baba küpe', 'babakupe', 'baba no', 'babano', 'father', 'boğa küpe', 'tohumlama küpe'],
  dogum_yeri:   ['doğum yeri', 'dogum yeri', 'işletme', 'isletme', 'origin', 'yerleşim'],
  notlar:       ['not', 'notlar', 'açıklama', 'aciklama', 'notes', 'remarks'],
  hayvan_tipi:  ['tip', 'tür', 'tur', 'hayvan türü', 'kategori', 'type', 'cinsi'],
};

function normalizeKey(str) {
  return (str || '').toLowerCase().trim()
    .replace(/\s+/g, ' ')
    .replace(/İ/g, 'i').replace(/Ş/g, 'ş').replace(/Ğ/g, 'ğ')
    .replace(/Ü/g, 'ü').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç')
    .replace(/I/g, 'i');
}

function findColMatch(header) {
  const h = normalizeKey(header);
  for (const [stdKey, aliases] of Object.entries(KOLON_MAP)) {
    if (aliases.some(a => normalizeKey(a) === h || h.includes(normalizeKey(a)))) {
      return stdKey;
    }
  }
  return null;
}

// ─── CİNSİYET NORMALIZASYONU ──────────────────────────────────────────────────
function normalizeGender(val) {
  if (!val) return '';
  const v = normalizeKey(String(val));
  if (['dişi', 'disi', 'f', 'female', 'd', 'inek', 'düve', 'duve'].some(x => v.includes(x))) return 'disi';
  if (['erkek', 'm', 'male', 'e', 'boga', 'boğa', 'tosun', 'dana'].some(x => v.includes(x))) return 'erkek';
  return '';
}

// ─── TARİH NORMALIZASYONU ─────────────────────────────────────────────────────
function normalizeDate(val) {
  if (!val) return '';
  if (val instanceof Date && !isNaN(val)) return val.toISOString().split('T')[0];
  const s = String(val).trim();
  // dd.mm.yyyy veya dd/mm/yyyy
  const m1 = s.match(/^(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}`;
  // yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // Sadece yıl (örn "2022")
  if (/^\d{4}$/.test(s)) return `${s}-01-01`;
  return s;
}

// ─── AY CİNSİNDEN YAŞ HESAPLA ────────────────────────────────────────────────
function calcAgeMonths(birthDateStr) {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth)) return null;
  const ms = Date.now() - birth.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 30.44));
}

// ─── OTOMATİK TÜR TESPİTİ ────────────────────────────────────────────────────
/**
 * Belgedeki bilgilere göre hayvan türünü otomatik belirler.
 * Öncelik sırası:
 *   1. Hayvan tipi kolonu varsa (inek, buzağı, düve, tosun)
 *   2. Yaş < 6 ay → buzagi
 *   3. Yaş 6–36 ay + dişi → duve
 *   4. Yaş 6–36 ay + erkek → tosun
 *   5. Geri kalan → inek
 */
function detectAnimalType(item) {
  // 1. Explicit hayvan tipi kolonu
  if (item.hayvan_tipi) {
    const t = normalizeKey(String(item.hayvan_tipi));
    if (t.includes('buzagi') || t.includes('buzağ') || t.includes('dana')) return 'buzagi';
    if (t.includes('duve') || t.includes('düve')) return 'duve';
    if (t.includes('tosun')) return 'tosun';
    if (t.includes('inek') || t.includes('sağmal')) return 'inek';
  }

  const ageMonths = calcAgeMonths(item.birth_date);

  if (ageMonths !== null) {
    if (ageMonths < 6) return 'buzagi';
    if (ageMonths < 36) {
      return item.gender === 'erkek' ? 'tosun' : 'duve';
    }
  }

  // Cinsiyet ipucu
  if (item.gender === 'erkek') return 'tosun';

  return 'inek'; // varsayılan
}

// ─── SATIR → ITEM DÖNÜŞÜMÜ ────────────────────────────────────────────────────
function rowToItem(getField) {
  const ear_tag = String(getField('ear_tag') || '').replace(/\s/g, '').trim().toUpperCase();
  if (!ear_tag) return null;

  const birth_date = normalizeDate(getField('birth_date'));
  const gender     = normalizeGender(getField('gender'));
  const weight     = parseFloat(getField('weight')) || 0;

  const item = {
    ear_tag,
    name:         String(getField('name') || '').trim(),
    breed:        String(getField('breed') || '').trim() || 'Belirsiz',
    gender,
    birth_date,
    weight,
    anne_kupe_no: String(getField('anne_kupe_no') || '').trim(),
    baba_kupe_no: String(getField('baba_kupe_no') || '').trim(),
    dogum_yeri:   String(getField('dogum_yeri') || '').trim(),
    notlar:       String(getField('notlar') || '').trim(),
    hayvan_tipi:  String(getField('hayvan_tipi') || '').trim(),
    ageMonths:    calcAgeMonths(birth_date),
  };

  // Otomatik tür tespiti
  item.autoType = detectAnimalType(item);

  return item;
}

// ─── EXCEL PARSER ──────────────────────────────────────────────────────────────
function parseExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (raw.length < 2) throw new Error('Excel boş veya başlık satırı eksik');

  const headers = raw[0].map(String);
  // kolonu parse et: header → stdKey
  const colIndex = {};
  headers.forEach((h, i) => {
    const match = findColMatch(h);
    if (match && colIndex[match] === undefined) colIndex[match] = i;
  });

  const items = [];
  for (const row of raw.slice(1)) {
    if (!Array.isArray(row) || row.every(c => c === '' || c === null)) continue;
    const getField = (k) => colIndex[k] !== undefined ? row[colIndex[k]] : undefined;
    const item = rowToItem(getField);
    if (item) items.push(item);
  }

  return { items, source: 'excel' };
}

// ─── CSV PARSER ────────────────────────────────────────────────────────────────
function parseCsv(buffer) {
  const text = buffer.toString('utf-8');
  const result = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (!result.data?.length) throw new Error('CSV boş');

  // Her satırın başlıklarını eşle
  const firstRow = result.data[0];
  const headerMatchCache = {};
  for (const hdr of Object.keys(firstRow)) {
    const match = findColMatch(hdr);
    if (match) headerMatchCache[match] = hdr;
  }

  const items = [];
  for (const row of result.data) {
    const getField = (k) => headerMatchCache[k] ? row[headerMatchCache[k]] : undefined;
    const item = rowToItem(getField);
    if (item) items.push(item);
  }

  return { items, source: 'csv' };
}

// ─── PDF METIN PARSER ─────────────────────────────────────────────────────────
async function parsePdfText(buffer) {
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(buffer);
  const text = data.text || '';

  if (text.trim().length < 50) {
    return { items: [], source: 'pdf-text', needsAi: true };
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const items = [];

  for (const line of lines) {
    const kupeMatch = line.match(/TR\d{10,}/i);
    if (!kupeMatch) continue;

    const ear_tag = kupeMatch[0].toUpperCase();

    // Cinsiyet
    let gender = '';
    if (/dişi|female/i.test(line)) gender = 'disi';
    else if (/erkek|male/i.test(line)) gender = 'erkek';

    // Doğum tarihi
    const dateMatch = line.match(
      /\b(\d{2})[.\-\/](\d{2})[.\-\/](\d{4})\b|\b(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})\b/
    );
    let birth_date = '';
    if (dateMatch) {
      const raw = dateMatch[0];
      if (/^\d{2}/.test(raw)) {
        const [d, m, y] = raw.split(/[.\-\/]/);
        birth_date = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
      } else {
        birth_date = raw.replace(/[.\-\/]/g, '-');
      }
    }

    // Irk
    let breed = 'Belirsiz';
    for (const irk of ['Simental', 'Holstein', 'Montofon', 'Esmer', 'Yerli', 'Jersey', 'Angus', 'Limouzin']) {
      if (new RegExp(irk, 'i').test(line)) { breed = irk; break; }
    }

    // Anne küpe  (satırda "Anne: TR..." veya ikinci TR... kodu)
    const allTrNos = [...line.matchAll(/TR\d{10,}/gi)].map(m => m[0].toUpperCase());
    const anne_kupe_no = allTrNos.length > 1 ? allTrNos[1] : '';

    // Kilo
    const kiloMatch = line.match(/(\d+[.,]?\d*)\s*(kg|kilo)/i);
    const weight = kiloMatch ? parseFloat(kiloMatch[1].replace(',', '.')) : 0;

    const row = { ear_tag, breed, gender, birth_date, weight, anne_kupe_no, baba_kupe_no: '', dogum_yeri: '', notlar: '', hayvan_tipi: '', ageMonths: calcAgeMonths(birth_date) };
    row.autoType = detectAnimalType(row);

    items.push(row);
  }

  if (items.length === 0) return { items: [], source: 'pdf-text', needsAi: true };

  return { items, source: 'pdf-text', needsAi: false };
}

// ─── GENEL DISPATCH ────────────────────────────────────────────────────────────
async function parseFile(buffer, mimetype, originalname) {
  const ext = (originalname || '').split('.').pop().toLowerCase();

  if (['xlsx', 'xls'].includes(ext) || /spreadsheet|excel/i.test(mimetype || '')) {
    return parseExcel(buffer);
  }
  if (ext === 'csv' || mimetype === 'text/csv') {
    return parseCsv(buffer);
  }
  if (ext === 'pdf' || mimetype === 'application/pdf') {
    return parsePdfText(buffer);
  }
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext) || (mimetype || '').startsWith('image/')) {
    return { items: [], source: 'image', needsAi: true };
  }

  throw new Error(`Desteklenmeyen dosya türü: .${ext}`);
}

module.exports = { parseFile, detectAnimalType, calcAgeMonths };
