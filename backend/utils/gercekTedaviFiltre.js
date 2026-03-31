/**
 * Suni tohumlama ve rutin tohumlama tipi kayıtları "tedavi" sayılmaz.
 * Sadece tohumlama / gebe ekranlarında görünür.
 */
function devamEdenGercekTedaviQuery(extra = {}) {
  return {
    ...extra,
    durum: 'devam_ediyor',
    tip: { $nin: ['tohumlama', 'asi'] },
    $nor: [{ tip: 'muayene', tani: 'Suni Tohumlama' }],
  };
}

module.exports = { devamEdenGercekTedaviQuery };
