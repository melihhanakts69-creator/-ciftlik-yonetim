const mongoose = require('mongoose');
const dnsPromises = require('dns').promises;

function buildMongoOpts() {
  const opts = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  };
  if (process.env.MONGO_FAMILY === '4') {
    opts.family = 4;
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function safeHostFromUri(uri) {
  try {
    const at = uri.indexOf('@');
    if (at === -1) return '(no-host)';
    return uri.slice(at + 1).split('/')[0].split('?')[0];
  } catch {
    return '(parse-error)';
  }
}

/** Atlas SRV → doğrudan mongodb:// host1:27017,host2:27017,... (Node dns.resolveSrv / TXT) */
async function expandSrvToDirectUri(srvUri) {
  const rest = srvUri.slice('mongodb+srv://'.length);
  const at = rest.indexOf('@');
  if (at === -1) throw new Error('mongodb+srv içinde @ yok');
  const auth = rest.slice(0, at);
  const afterAt = rest.slice(at + 1);
  const slash = afterAt.indexOf('/');
  const fqdn = slash === -1 ? afterAt.split('?')[0] : afterAt.slice(0, slash);
  const pathAndQuery = slash === -1 ? '/' : afterAt.slice(slash);

  const pathPart = pathAndQuery.split('?')[0] || '/';
  const queryPart = pathAndQuery.includes('?') ? pathAndQuery.split('?').slice(1).join('?') : '';

  const srvName = `_mongodb._tcp.${fqdn}`;
  const records = await dnsPromises.resolveSrv(srvName);
  records.sort((a, b) => a.priority - b.priority || a.weight - b.weight);
  const hosts = records
    .map((r) => `${String(r.name).replace(/\.$/, '')}:${r.port}`)
    .join(',');

  let txtFlat = [];
  try {
    const txt = await dnsPromises.resolveTxt(srvName);
    txtFlat = txt.flat();
  } catch (_) {}

  const params = new URLSearchParams(queryPart);
  for (const line of txtFlat) {
    for (const seg of String(line).split('&')) {
      if (!seg) continue;
      const eq = seg.indexOf('=');
      const k = eq === -1 ? seg : seg.slice(0, eq);
      const v = eq === -1 ? '' : seg.slice(eq + 1);
      if (k && !params.has(k)) params.set(k, v);
    }
  }
  if (!params.has('tls') && !params.has('ssl')) params.set('tls', 'true');
  if (!params.has('retryWrites')) params.set('retryWrites', 'true');

  const qs = params.toString();
  return `mongodb://${auth}@${hosts}${pathPart}?${qs}`;
}

function ensureTlsParams(mongoUri) {
  if (!mongoUri.startsWith('mongodb://')) return mongoUri;
  const qIdx = mongoUri.indexOf('?');
  const base = qIdx === -1 ? mongoUri : mongoUri.slice(0, qIdx);
  const q = qIdx === -1 ? '' : mongoUri.slice(qIdx + 1);
  const params = new URLSearchParams(q);
  if (!params.has('tls') && !params.has('ssl')) params.set('tls', 'true');
  if (!params.has('retryWrites')) params.set('retryWrites', 'true');
  const qs = params.toString();
  return qs ? `${base}?${qs}` : `${base}?tls=true&retryWrites=true`;
}

async function connectDB() {
  const uri = process.env.MONGODB_URI ? String(process.env.MONGODB_URI).trim() : '';

  if (!uri) {
    console.error('[MongoDB] HATA: MONGODB_URI tanımlı değil veya boş');
    return false;
  }
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error('[MongoDB] HATA: MONGODB_URI mongodb:// veya mongodb+srv:// ile başlamalı');
    return false;
  }

  let connectUri = uri;
  if (uri.startsWith('mongodb+srv://') && process.env.MONGO_SKIP_SRV_EXPAND !== '1') {
    try {
      connectUri = await expandSrvToDirectUri(uri);
      console.log('[MongoDB] SRV → direct (Node DNS), bağlantı uzunluğu=', connectUri.length);
    } catch (e) {
      console.error('[MongoDB] SRV genişletme başarısız, mongodb+srv denenecek:', e?.message || e);
      connectUri = uri;
    }
  } else if (uri.startsWith('mongodb://')) {
    connectUri = ensureTlsParams(uri);
  }

  console.log(
    '[MongoDB] kaynak URI uzunluk=',
    uri.length,
    uri.startsWith('mongodb+srv') ? '(srv)' : '(direct)'
  );
  const mo = buildMongoOpts();
  console.log('[MongoDB] mongoose seçenekleri:', {
    serverSelectionTimeoutMS: mo.serverSelectionTimeoutMS,
    socketTimeoutMS: mo.socketTimeoutMS,
    family: mo.family != null ? mo.family : 'varsayılan (önerilen)',
  });

  const host = safeHostFromUri(connectUri);
  const maxAttempts = Math.max(1, parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[MongoDB] deneme ${attempt}/${maxAttempts} host=${host}`);

    try {
      if (mongoose.connection.readyState === 1) {
        console.log('[MongoDB] BAŞARILI: bağlantı zaten açık');
        return true;
      }

      await mongoose.connect(connectUri, buildMongoOpts());
      console.log('[MongoDB] BAŞARILI: MongoDB bağlandı');
      return true;
    } catch (err) {
      console.error('[MongoDB] HATA:', err?.message || String(err));
      if (err?.stack) console.error(err.stack);
      try {
        await mongoose.disconnect();
      } catch (_) {}
      if (attempt < maxAttempts) {
        await sleep(Math.min(2000 * 2 ** (attempt - 1), 30000));
      }
    }
  }

  console.error('[MongoDB] HATA: tüm bağlantı denemeleri başarısız');
  return false;
}

module.exports = connectDB;
