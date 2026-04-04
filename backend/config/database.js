const mongoose = require('mongoose');
const util = require('util');

function maskMongoUri(uri) {
  try {
    return uri.replace(/:\/\/([^:/?#]+):([^@]+)@/, '://$1:***@');
  } catch {
    return '(mask failed)';
  }
}

function buildMongoOpts() {
  const opts = {
    serverSelectionTimeoutMS: Math.min(
      60000,
      parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || '30000', 10)
    ),
  };
  if (process.env.MONGO_FAMILY === '4') {
    opts.family = 4;
    console.log('[MongoDB] MONGO_FAMILY=4 (forced IPv4)');
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

async function connectDB() {
  const uri = process.env.MONGODB_URI ? String(process.env.MONGODB_URI).trim() : '';

  if (!uri) {
    console.error('[MongoDB] FAIL: MONGODB_URI is missing or empty (set in Render Environment)');
    return false;
  }
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error('[MongoDB] FAIL: MONGODB_URI must start with mongodb:// or mongodb+srv://');
    return false;
  }

  if (/<password>/i.test(uri) || /%3Cpassword%3E/i.test(uri)) {
    console.error(
      '[MongoDB] FAIL: MONGODB_URI still contains Atlas placeholder <password> — replace with real DB user password in Render env'
    );
    return false;
  }

  const host = safeHostFromUri(uri);
  const maxAttempts = Math.max(1, parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10));

  let uriMaskedLogged = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (!uriMaskedLogged) {
      uriMaskedLogged = true;
      console.log('[MongoDB] uriMasked:', maskMongoUri(uri));
    }
    console.log(
      `[MongoDB] connect attempt ${attempt}/${maxAttempts} host=${host}`
    );

    try {
      if (mongoose.connection.readyState === 1) {
        console.log('[MongoDB] OK: already connected');
        return true;
      }

      await mongoose.connect(uri, buildMongoOpts());

      console.log('[MongoDB] OK: connected readyState=', mongoose.connection.readyState);
      return true;
    } catch (err) {
      const bits = [err?.message || String(err)];
      if (err?.name) bits.push(`name=${err.name}`);
      if (err?.code) bits.push(`code=${err.code}`);
      if (err?.reason?.message) bits.push(`reason=${err.reason.message}`);
      if (err?.cause?.message) bits.push(`cause=${err.cause.message}`);
      else if (err?.cause) bits.push(`cause=${util.inspect(err.cause, { depth: 1 })}`);
      if (err?.reason && typeof err.reason === 'object' && err.reason.servers?.size != null) {
        bits.push(`topologyServers=${err.reason.servers.size}`);
      }
      console.error(`[MongoDB] FAIL attempt ${attempt}/${maxAttempts}:`, bits.join(' | '));
      try {
        await mongoose.disconnect();
      } catch (_) {}
      if (attempt < maxAttempts) {
        await sleep(Math.min(2000 * 2 ** (attempt - 1), 30000));
      }
    }
  }

  console.error('[MongoDB] FAIL: all connection attempts exhausted');
  return false;
}

module.exports = connectDB;
