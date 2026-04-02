const mongoose = require('mongoose');

/**
 * Çok kiracılı kayıtlarda userId ile aynı mantıkta tenantId ekler (Inek/Buzagi vb. ile uyumlu).
 * req.tenantId yoksa (eski oturum) sorgu olduğu gibi kalır.
 */
function addTenant(req, query) {
  if (!req.tenantId) return { ...query };
  return {
    ...query,
    tenantId: new mongoose.Types.ObjectId(req.tenantId),
  };
}

module.exports = { addTenant };
