const mongoose = require('mongoose');
const dns = require('dns');
const dnsPromises = require('dns').promises;

const MONGO_OPTS = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
};

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

/**
 * Expand mongodb+srv:// into mongodb://host1:27017,host2:27017,... using SRV + TXT (same as driver).
 * If SRV/TXT fails, returns original URI so Mongoose can attempt SRV mode.
 */
async function expandSrvToDirectUri(srvUri) {
  if (!srvUri.startsWith('mongodb+srv://')) return srvUri;

  const rest = srvUri.slice('mongodb+srv://'.length);
  const at = rest.indexOf('@');
  if (at === -1) return srvUri;
  const auth = rest.slice(0, at);
  const afterAt = rest.slice(at + 1);
  const slash = afterAt.indexOf('/');
  const fqdn = slash === -1 ? afterAt.split('?')[0] : afterAt.slice(0, slash);
  const pathAndQuery = slash === -1 ? '/' : afterAt.slice(slash);

  const pathPart = pathAndQuery.split('?')[0] || '/';
  const queryPart = pathAndQuery.includes('?') ? pathAndQuery.split('?').slice(1).join('?') : '';

  const srvName = `_mongodb._tcp.${fqdn}`;
  let records;
  try {
    records = await dnsPromises.resolveSrv(srvName);
  } catch (e) {
    console.error('[MongoDB] ERROR: SRV resolve failed:', e?.message || String(e));
    return srvUri;
  }

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

function ensureDirectUriTls(mongoUri) {
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

function logDnsLookup(hostname) {
  const h = hostname.split(':')[0].replace(/\.$/, '');
  dns.lookup(h, { family: 4 }, (err, address) => {
    console.log('DNS RESULT:', err || null, address);
  });
}

async function connectDB() {
  const uri = process.env.MONGODB_URI ? String(process.env.MONGODB_URI).trim() : '';

  if (!uri) {
    console.error('[MongoDB] ERROR: MONGODB_URI is missing or empty');
    return false;
  }
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error('[MongoDB] ERROR: MONGODB_URI must start with mongodb:// or mongodb+srv://');
    return false;
  }

  if (/<password>/i.test(uri) || /%3Cpassword%3E/i.test(uri)) {
    console.error('[MongoDB] ERROR: MONGODB_URI contains Atlas placeholder <password>');
    return false;
  }

  console.log('[MongoDB] MONGODB_URI length=', uri.length);

  const host = safeHostFromUri(uri);
  logDnsLookup(host);

  let connectUri = uri;
  if (uri.startsWith('mongodb+srv://')) {
    connectUri = await expandSrvToDirectUri(uri);
    if (connectUri !== uri) {
      console.log('[MongoDB] using direct mongodb:// host list (expanded from SRV), length=', connectUri.length);
    }
  } else {
    connectUri = ensureDirectUriTls(uri);
  }

  const maxAttempts = Math.max(1, parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[MongoDB] connect attempt ${attempt}/${maxAttempts} host=${host}`);

    try {
      if (mongoose.connection.readyState === 1) {
        console.log('MongoDB CONNECTED');
        return true;
      }

      await mongoose.connect(connectUri, MONGO_OPTS);
      console.log('MongoDB CONNECTED');
      return true;
    } catch (err) {
      const msg = err?.message || String(err);
      const stack = err?.stack || '';
      console.error('[MongoDB] ERROR:', msg);
      console.error(stack);
      try {
        await mongoose.disconnect();
      } catch (_) {}
      if (attempt < maxAttempts) {
        await sleep(Math.min(2000 * 2 ** (attempt - 1), 30000));
      }
    }
  }

  console.error('[MongoDB] ERROR: all connection attempts exhausted');
  return false;
}

module.exports = connectDB;
