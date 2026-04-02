/**
 * userId'si olan ama tenantId'si boş/eksik kayıtları, ilgili kullanıcının User.tenantId değeri ile doldurur.
 * Çok kiracılı sorgular (addTenant) ile uyum için bir kerelik veya idempotent bakım.
 *
 * Kullanım (backend klasöründen):
 *   node scripts/backfillTenantIds.js
 * Sadece rapor (yazma yok):
 *   DRY_RUN=1 node scripts/backfillTenantIds.js
 *
 * Windows PowerShell:
 *   $env:DRY_RUN="1"; node scripts/backfillTenantIds.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Inek = require('../models/Inek');
const Duve = require('../models/Duve');
const Buzagi = require('../models/Buzagi');
const Tosun = require('../models/Tosun');
const SutKaydi = require('../models/SutKaydi');
const Timeline = require('../models/Timeline');
const SaglikKaydi = require('../models/SaglikKaydi');

const MODELS = [
  ['Inek', Inek],
  ['Duve', Duve],
  ['Buzagi', Buzagi],
  ['Tosun', Tosun],
  ['SutKaydi', SutKaydi],
  ['Timeline', Timeline],
  ['SaglikKaydi', SaglikKaydi],
];

const missingTenantFilter = (userId) => ({
  userId,
  $or: [{ tenantId: null }, { tenantId: { $exists: false } }],
});

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI tanımlı değil.');
    process.exit(1);
  }

  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(dryRun ? 'DRY RUN — veritabanı güncellenmeyecek\n' : 'Güncelleme modu\n');

  const users = await User.find({ tenantId: { $ne: null } }).select('_id tenantId').lean();

  let grand = 0;
  for (const [collectionLabel, Model] of MODELS) {
    let collectionTotal = 0;
    for (const u of users) {
      const filter = missingTenantFilter(u._id);
      if (dryRun) {
        const n = await Model.countDocuments(filter);
        collectionTotal += n;
      } else {
        const res = await Model.updateMany(filter, { $set: { tenantId: u.tenantId } });
        collectionTotal += res.modifiedCount;
      }
    }
    console.log(`${collectionLabel}: ${collectionTotal}${dryRun ? ' (eksik sayısı)' : ' güncellendi'}`);
    grand += collectionTotal;
  }

  console.log(`\nToplam: ${grand}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
