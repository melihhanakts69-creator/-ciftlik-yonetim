/**
 * fileParser.js — Hibrit Dosya Okuyucu
 * Excel → xlsx, CSV → papaparse, PDF → pdf-parse + regex
 * Hiç AI kullanmaz; gerektiğinde geminiVision.js devreye girer.
 */

const XLSX = require('xlsx');
const Papa = require('papaparse');

// ─── KOLON EŞLEŞTİRME ─────────────────────────────────────────────────────────
const KOLON_MAP = {
  ear_tag:    ['küpe no', 'kupeno', 'kupeNo', 'ear_tag', 'eartag', 'hayvan no', 'hayvanno', 'hayvan numarası', 'no', 'küpe'],
  breed:      ['ırk', 'irkı', 'irk', 'breed', 'ırk adı'],
  gender:     ['cinsiyet', 'gender', 'cins', 'sex'],
  birth_date: ['doğum tarihi', 'dogum tarihi', 'dogumtarihi', 'birth_date', 'birthdate', 'd.tarihi', 'dogtar'],
  name:       ['isim', 'ad', 'name', 'hayvan adı'],
  weight:     ['kilo', 'ağırlık', 'agirlik', 'weight', 'kg'],
};

function normalizeKey(str) {
  return (str || '').toLowerCase().trim()
    .replace(/\s+/g, ' ')
    .replace(/[İ]/g, 'i').replace(/[Ş]/g, 'ş')
    .replace(/[Ğ]/g, 'ğ').replace(/[Ü]/g, 'ü')
    .replace(/[Ö]/g, 'ö').replace(/[Ç]/g, 'ç')
    .replace(/[I]/g, 'i');
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

function normalizeGender(val) {
  if (!val) return '';
  const v = normalizeKey(String(val));
  if (v.includes('dişi') || v.includes('disi') || v === 'f' || v === 'female' || v === 'd') return 'inek';
  if (v.includes('erkek') || v === 'm' || v === 'male' || v === 'e') return 'boga';
  if (v.includes('inek')) return 'inek';
  if (v.includes('dana') || v.includes('buzağ') || v.includes('buzagi')) return 'buzagi';
  return val;
}

function normalizeDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  const s = String(val).trim();
  // dd.mm.yyyy → yyyy-mm-dd
  const match1 = s.match(/^(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{4})$/);
  if (match1) return `${match1[3]}-${match1[2].padStart(2,'0')}-${match1[1].padStart(2,'0')}`;
  // yyyy-mm-dd already
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function rowsToItems(headers, rows) {
  // headers: string array, rows: 2D array or object array
  const colMap = {}; // stdKey → index or key
  if (Array.isArray(headers)) {
    headers.forEach((h, i) => {
      const match = findColMatch(h);
      if (match) colMap[match] = i;
    });
  }

  const items = [];
  for (const row of rows) {
    const get = (stdKey) => {
      if (Array.isArray(row)) {
        return colMap[stdKey] !== undefined ? row[colMap[stdKey]] : undefined;
      }
      // object row (papaparse)
      for (const [hdr, val] of Object.entries(row)) {
        if (findColMatch(hdr) === stdKey) return val;
      }
      return undefined;
    };

    const ear_tag = String(get('ear_tag') || '').trim();
    if (!ear_tag) continue; // küpe no yoksa atla

    items.push({
      ear_tag,
      breed:      String(get('breed') || '').trim() || 'Belirsiz',
      gender:     normalizeGender(get('gender')),
      birth_date: normalizeDate(get('birth_date')),
      name:       String(get('name') || '').trim(),
      weight:     parseFloat(get('weight')) || 0,
    });
  }
  return items;
}

// ─── EXCEL PARSER ──────────────────────────────────────────────────────────────
function parseExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  if (raw.length < 2) throw new Error('Excel boş veya başlık satırı eksik');

  const headers = raw[0].map(String);
  const rows = raw.slice(1).filter(r => r.some(c => c !== ''));
  const items = rowsToItems(headers, rows);

  return { items, source: 'excel' };
}

// ─── CSV PARSER ────────────────────────────────────────────────────────────────
function parseCsv(buffer) {
  const text = buffer.toString('utf-8');
  const result = Papa.parse(text, { header: true, skipEmptyLines: true, encoding: 'UTF-8' });

  if (!result.data || result.data.length === 0) throw new Error('CSV boş');

  const items = [];
  for (const row of result.data) {
    const ear_tag = String(Object.entries(row).find(([k]) => findColMatch(k) === 'ear_tag')?.[1] || '').trim();
    if (!ear_tag) continue;
    const get = (stdKey) => Object.entries(row).find(([k]) => findColMatch(k) === stdKey)?.[1];
    items.push({
      ear_tag,
      breed:      String(get('breed') || '').trim() || 'Belirsiz',
      gender:     normalizeGender(get('gender')),
      birth_date: normalizeDate(get('birth_date')),
      name:       String(get('name') || '').trim(),
      weight:     parseFloat(get('weight')) || 0,
    });
  }

  return { items, source: 'csv' };
}

// ─── PDF METIN PARSER (regex ile) ─────────────────────────────────────────────
async function parsePdfText(buffer) {
  let pdfParse;
  try {
    pdfParse = require('pdf-parse');
  } catch (e) {
    throw new Error('pdf-parse modülü yüklenemedi');
  }

  const data = await pdfParse(buffer);
  const text = data.text;

  if (!text || text.trim().length < 50) {
    return { items: [], source: 'pdf-text', needsAi: true, rawText: text };
  }

  // TR küpe no pattern: TR + rakamlar (en az 10 karakter)
  const kupePattern = /TR[\d\s]{8,20}/gi;
  const matches = [...text.matchAll(kupePattern)];

  if (matches.length === 0) {
    return { items: [], source: 'pdf-text', needsAi: true, rawText: text };
  }

  // Basit satır bazlı parse
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const items = [];

  for (const line of lines) {
    const kupeMatch = line.match(/TR\d{10,}/i);
    if (!kupeMatch) continue;

    const ear_tag = kupeMatch[0].replace(/\s/g, '').toUpperCase();
    // Cinsiyet
    let gender = '';
    if (/dişi|female/i.test(line)) gender = 'inek';
    else if (/erkek|male/i.test(line)) gender = 'boga';

    // Doğum tarihi (dd.mm.yyyy veya yyyy-mm-dd)
    const dateMatch = line.match(/\b(\d{2})[.\-\/](\d{2})[.\-\/](\d{4})\b|\b(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})\b/);
    let birth_date = '';
    if (dateMatch) {
      birth_date = dateMatch[0].replace(/[.\-\/]/g, '-');
      if (/^\d{2}/.test(birth_date)) {
        const p = birth_date.split('-');
        birth_date = `${p[2]}-${p[1]}-${p[0]}`;
      }
    }

    // Irk (heuristik)
    let breed = 'Belirsiz';
    const irklar = ['Simental', 'Holstein', 'Montofon', 'Esmer', 'Yerli', 'Jersey', 'Angus', 'Limouzin'];
    for (const irk of irklar) {
      if (line.toLowerCase().includes(irk.toLowerCase())) { breed = irk; break; }
    }

    items.push({ ear_tag, breed, gender, birth_date, name: '', weight: 0 });
  }

  if (items.length === 0) {
    return { items: [], source: 'pdf-text', needsAi: true, rawText: text };
  }

  return { items, source: 'pdf-text', needsAi: false };
}

// ─── GENEL DISPATCH ────────────────────────────────────────────────────────────
async function parseFile(buffer, mimetype, originalname) {
  const ext = (originalname || '').split('.').pop().toLowerCase();

  if (ext === 'xlsx' || ext === 'xls' || mimetype?.includes('spreadsheet') || mimetype?.includes('excel')) {
    return parseExcel(buffer);
  }

  if (ext === 'csv' || mimetype === 'text/csv') {
    return parseCsv(buffer);
  }

  if (ext === 'pdf' || mimetype === 'application/pdf') {
    return parsePdfText(buffer);
  }

  // Görsel — AI gerekli
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext) || (mimetype || '').startsWith('image/')) {
    return { items: [], source: 'image', needsAi: true };
  }

  throw new Error(`Desteklenmeyen dosya türü: .${ext}`);
}

module.exports = { parseFile };
