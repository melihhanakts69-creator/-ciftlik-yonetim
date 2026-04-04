const mongoose = require('mongoose');

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

  const host = safeHostFromUri(uri);
  const maxAttempts = Math.max(1, parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
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
