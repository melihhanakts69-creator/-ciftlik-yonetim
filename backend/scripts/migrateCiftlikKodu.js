/**
 * Mevcut çiftlik tenant'larına ciftlikKodu atar.
 * Bir kere çalıştır: node backend/scripts/migrateCiftlikKodu.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const tenants = await Tenant.find({ ciftlikKodu: { $in: [null, ''] } })
    .populate('ownerUser', 'rol');
  let count = 0;
  for (const tenant of tenants) {
    const owner = tenant.ownerUser;
    if (!owner || owner.rol !== 'ciftci') continue;
    tenant.ciftlikKodu = await Tenant.generateCiftlikKodu();
    await tenant.save();
    count++;
    console.log(`Tenant ${tenant._id} (${tenant.name}) -> ${tenant.ciftlikKodu}`);
  }
  console.log(`Toplam ${count} çiftlik tenant'ına kod atandı.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
