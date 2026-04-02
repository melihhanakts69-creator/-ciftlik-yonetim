const mongoose = require('mongoose');

/**
 * Çok kiracılı kayıtlarda tenantId ile filtreler.
 * Eski veritabanı kayıtlarında tenantId yok/null olabilir; sadece tenantId === req.tenantId
 * dersen bu kayıtlar hiç dönmez. userId zaten istekte sabit olduğu için güvenlik aynı kalır.
 */
function addTenant(req, query) {
  if (!req.tenantId) return { ...query };
  const tid = new mongoose.Types.ObjectId(req.tenantId);
  const legacyTenant = {
    $or: [
      { tenantId: tid },
      { tenantId: null },
      { tenantId: { $exists: false } },
    ],
  };
  const q = { ...query };
  if (q.$or !== undefined || q.$and !== undefined) {
    return { $and: [q, legacyTenant] };
  }
  return { ...q, ...legacyTenant };
}

module.exports = { addTenant };
