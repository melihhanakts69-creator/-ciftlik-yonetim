import axios from 'axios';
import api, { API_URL } from './apiClient';

// AUTH
export const register = (userData) => api.post('/auth/register', userData).then(res => {
  if (res.data.refreshToken) {
    localStorage.setItem('refreshToken', res.data.refreshToken);
  }
  return res;
});
export const login = (credentials) => api.post('/auth/login', credentials).then(res => {
  if (res.data.refreshToken) {
    localStorage.setItem('refreshToken', res.data.refreshToken);
  }
  return res;
});
export const getProfile = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/update', data);

// ── Kurumsal Ayarlar: Alt Hesap Servisleri ──
export const getSubAccounts = () => api.get('/auth/sub-accounts');
export const createSubAccount = (data) => api.post('/auth/sub-accounts', data);
export const deleteSubAccount = (id) => api.delete(`/auth/sub-accounts/${id}`);

export const logout = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const promise = refreshToken
    ? api.post('/auth/logout', { refreshToken })
    : Promise.resolve();
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  return promise;
};

// İNEKLER
export const getInekler = () => api.get('/inekler');
export const getInek = (id) => api.get(`/inekler/${id}`); // YENİ
export const createInek = (data) => api.post('/inekler', data);
export const updateInek = (id, data) => api.put(`/inekler/${id}`, data);
export const deleteInek = (id) => api.delete(`/inekler/${id}`);
export const inekDogurdu = (id, data) => api.post(`/inekler/${id}/dogurdu`, data);
export const inekTohumla = (id, data) => api.post(`/inekler/${id}/tohumlama`, data);
export const deleteInekTohumlama = (id) => api.delete(`/inekler/${id}/tohumlama`);

// BUZAĞILAR
export const getBuzagilar = () => api.get('/buzagilar');
export const getBuzagi = (id) => api.get(`/buzagilar/${id}`); // YENİ
export const createBuzagi = (data) => api.post('/buzagilar', data);
export const updateBuzagi = (id, data) => api.put(`/buzagilar/${id}`, data);
export const deleteBuzagi = (id) => api.delete(`/buzagilar/${id}`);

// DÜVELER
export const getDuveler = () => api.get('/duveler');
export const getDuve = (id) => api.get(`/duveler/${id}`); // YENİ
export const createDuve = (data) => api.post('/duveler', data);
export const deleteDuve = (id) => api.delete(`/duveler/${id}`);
export const updateDuve = (id, data) => {
  return api.put(`/duveler/${id}`, data);
};
export const duveDogurdu = (id, data) => api.post(`/duveler/${id}/dogurdu`, data);
export const duveTohumla = (id, data) => api.post(`/duveler/${id}/tohumlama`, data);
export const deleteDuveTohumlama = (id) => api.delete(`/duveler/${id}/tohumlama`);


//Tosunlar
export const getTosunlar = () => api.get('/tosunlar');
export const getTosun = (id) => api.get(`/tosunlar/${id}`); // YENİ
export const createTosun = (data) => api.post('/tosunlar', data);
export const updateTosun = (id, data) => api.put(`/tosunlar/${id}`, data);
export const deleteTosun = (id) => api.delete(`/tosunlar/${id}`);

// BUZAĞI GEÇİŞ
export const getGecisKontrol = () => api.get('/buzagilar/kontrol-gecis');
export const buzagiGecisYap = (id) => api.post(`/buzagilar/gecis-yap/${id}`);

// SÜT KAYITLARI
export const getSutKayitlari = () => api.get('/sut-kayitlari');
export const createSutKaydi = (data) => api.post('/sut-kayitlari', data);
export const deleteSutKaydi = (id) => api.delete(`/sut-kayitlari/${id}`);

export const topluSilTarihSagim = (data) => api.delete('/sut-kayitlari/toplu-sil/tarih', { data });
export const topluSilSecili = (kayitIdler) => api.delete('/sut-kayitlari/toplu-sil/secili', { data: { kayitIdler } });

// YEM DEPOSU
export const getYemStok = () => api.get('/yemler/stok');
export const createYemStok = (data) => api.post('/yemler/stok', data);
export const getYemHareketler = () => api.get('/yemler/hareketler');
export const createYemHareket = (data) => api.post('/yemler/hareket', data);

// AYARLAR
export const getAyarlar = () => api.get('/ayarlar');
export const updateAyarlar = (data) => api.put('/ayarlar', data);
export const otomatikTuketimCalistir = () => api.post('/ayarlar/otomatik-tuketim');


// TIMELINE
export const getTimeline = (hayvanId) => api.get(`/timeline/${hayvanId}`);
export const createTimeline = (data) => api.post('/timeline', data);
export const deleteTimeline = (id) => api.delete(`/timeline/${id}`);
export const getYaklasanDogumlar = () => api.get('/timeline/yaklasan/dogumlar');
export const getKontrolBekleyenler = () => api.get('/timeline/kontrol-bekleyenler');

// TOPLU SÜT
export const topluSutOnizleme = (data) => api.post('/toplu-sut/onizleme', data);
export const topluSutKaydet = (data) => api.post('/toplu-sut', data);
export const topluSutGecmis = (limit) => api.get(`/toplu-sut/gecmis?limit=${limit || 30}`);
export const topluSutDetay = (id) => api.get(`/toplu-sut/${id}`);
export const topluSutSil = (id) => api.delete(`/toplu-sut/${id}`);
export const topluSutSilByTarihSagim = (tarih, sagim) => api.delete(`/toplu-sut/tarih/${tarih}/${sagim}`);

// FİNANSAL
export const getFinansalKayitlar = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/finansal?${query}`);
};
export const getFinansalOzet = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/finansal/ozet?${query}`);
};
export const createFinansalKayit = (data) => api.post('/finansal', data);
export const updateFinansalKayit = (id, data) => api.put(`/finansal/${id}`, data);
export const deleteFinansalKayit = (id) => api.delete(`/finansal/${id}`);

// BİLDİRİMLER
export const getBildirimler = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/bildirimler?${query}`);
};
export const getOkunmayanBildirimler = () => api.get('/bildirimler/liste/okunmayan');
export const getYaklasanBildirimler = (gun = 7) => api.get(`/bildirimler/liste/yaklasan?gun=${gun}`);
export const getBildirimIstatistikleri = () => api.get('/bildirimler/ozet/istatistik');
export const bildirimOkunduIsaretle = (id) => api.patch(`/bildirimler/${id}/okundu`);
export const tumunuOkunduIsaretle = () => api.patch('/bildirimler/toplu/okundu');
export const silOkunmusBildirimler = () => api.delete('/bildirimler/toplu/okunmus');
export const bildirimSil = (id) => api.delete(`/bildirimler/${id}`);
export const bildirimTamamlandiIsaretle = (id) => api.patch(`/bildirimler/${id}/tamamlandi`);

// ALIŞ - SATIŞ
export const getAlisSatisKayitlari = (params) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/alis-satis?${query}`);
};
export const getAlisSatisOzet = (type, params) => { // type: 'alis' or 'satis'
  const query = new URLSearchParams(params).toString();
  return api.get(`/alis-satis/ozet/${type}?${query}`);
};
export const createSatisIslemi = (data) => api.post('/alis-satis/satis', data);
export const createAlisIslemi = (data) => api.post('/alis-satis/alis', data);
export const getHayvanGecmisi = (id) => api.get(`/alis-satis/hayvan/${id}`);

// DASHBOARD
export const getYapilacaklar = () => api.get('/dashboard/yapilacaklar');

// YEM YÖNETİM SİSTEMİ (Phase 3.5)
export const getYemKutuphanesi = () => api.get('/yem-yonetim/kutuphane');
export const createYemItem = (data) => api.post('/yem-yonetim/kutuphane', data);
export const syncStokToLibrary = () => api.post('/yem-yonetim/kutuphane/sync-stok');
export const deleteYemItem = (id) => api.delete(`/yem-yonetim/kutuphane/${id}`);

export const getRasyonlar = () => api.get('/yem-yonetim/rasyon');
export const createRasyon = (data) => api.post('/yem-yonetim/rasyon', data);
export const deleteRasyon = (id) => api.delete(`/yem-yonetim/rasyon/${id}`);

// Yem Dağıt (Depodan düş, maliyet yaz)
// data: { rasyonId: string, tarih: string (optional) }
export const rasyonDagit = (data) => api.post('/yem-yonetim/dagit', data);

// SAĞLIK MODÜLÜ
export const getSaglikKayitlari = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/saglik?${query}`);
};
export const getSaglikByHayvan = (hayvanId) => api.get(`/saglik/hayvan/${hayvanId}`);
export const getSaglikIstatistikleri = () => api.get('/saglik/istatistik');
export const getYaklasanSagliklar = (gun = 7) => api.get(`/saglik/yaklasan?gun=${gun}`);
export const createSaglikKaydi = (data) => api.post('/saglik', data);
export const updateSaglikKaydi = (id, data) => api.put(`/saglik/${id}`, data);
export const deleteSaglikKaydi = (id) => api.delete(`/saglik/${id}`);
export const getVeterinerlerim = () => api.get('/saglik/veterinerlerim');

// Danışma (çiftçi–veteriner mesajlaşma)
export const getDanismaThreads = () => api.get('/danismalar');
export const getDanismaMesajlar = (otherUserId) => api.get(`/danismalar/${otherUserId}`);
export const postDanismaMesaj = (aliciId, mesaj) => api.post('/danismalar', { aliciId, mesaj });

// AŞI TAKVİMİ
export const getAsiTakvimi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/saglik/asi-takvimi?${query}`);
};
export const createAsiKaydi = (data) => api.post('/saglik/asi', data);
export const updateAsiKaydi = (id, data) => api.put(`/saglik/asi/${id}`, data);
export const deleteAsiKaydi = (id) => api.delete(`/saglik/asi/${id}`);

// TAKVİM MODÜLÜ
export const getTakvim = (ay, yil) => api.get(`/takvim?ay=${ay}&yil=${yil}`);

// STOK MODÜLÜ
export const getStoklar = () => api.get('/stok');
export const createStok = (data) => api.post('/stok', data);
export const updateStok = (id, data) => api.put(`/stok/${id}`, data);
export const deleteStok = (id) => api.delete(`/stok/${id}`);

// AI SOHBET
export const askAi = (type, data) => api.post(`/ai/${type}`, data);
export const getAiHistory = () => api.get('/ai/history');
export const getAiChat = (id) => api.get(`/ai/history/${id}`);

// SÜT TOPLAYICI (çiftlik kodu ile bağlanan sektör)
export const toplayiciCiftlikEkle = (ciftlikKodu) => api.post('/toplayici/ciftlik-ekle', { ciftlikKodu });
export const getToplayiciCiftlikler = () => api.get('/toplayici/ciftlikler');
export const getToplayiciOzet = () => api.get('/toplayici/ozet');
export const getToplayiciSonToplamalar = () => api.get('/toplayici/son-toplamalar');
export const toplayiciSutToplama = (data) => api.post('/toplayici/sut-toplama', data);

// VETERINER (merkezi api ile doğru backend adresi kullanılır)
export const getVeterinerMusteriler = () => api.get('/veteriner/musteriler');
export const getVeterinerOzet = () => api.get('/veteriner/ozet');
export const getVeterinerSonSaglikKayitlari = () => api.get('/veteriner/son-saglik-kayitlari');
export const getVeterinerHayvanAra = (kupeNo) => api.get('/veteriner/hayvan-ara', { params: { kupeNo } });
export const getVeterinerMusteriSaglikKayitlari = (ciftciId) => api.get(`/veteriner/musteri/${ciftciId}/saglik-kayitlari`);
export const veterinerMusteriEkleKod = (ciftlikKodu) => api.post('/veteriner/musteri-ekle-kod', { ciftlikKodu });
export const veterinerMusteriEkle = (ciftciId) => api.post('/veteriner/musteri-ekle', { ciftciId });
export const getMusteriHayvanlar = (ciftciId) => api.get(`/veteriner/musteri/${ciftciId}/hayvanlar`);
export const postMusteriHayvanSaglik = (ciftciId, hayvanId, payload) =>
  api.post(`/veteriner/musteri/${ciftciId}/hayvan/${hayvanId}/saglik`, payload);

export const getVeterinerCari = () => api.get('/veteriner/finans/cari');
export const getVeterinerCariDetay = (ciftciId) => api.get(`/veteriner/finans/cari/${ciftciId}`);
export const postVeterinerTahsilat = (data) => api.post('/veteriner/finans/tahsilat', data);
export const postVeterinerHatirlatma = (ciftciId) => api.post(`/veteriner/finans/hatirlatma-gonder/${ciftciId}`);

export const getVeterinerRandevu = (baslangic, bitis) => api.get('/veteriner/randevu', { params: { baslangic, bitis } });
export const postVeterinerRandevu = (data) => api.post('/veteriner/randevu', data);
export const patchVeterinerRandevu = (id, data) => api.patch(`/veteriner/randevu/${id}`, data);
export const getVeterinerZiyaretOnerileri = () => api.get('/veteriner/ziyaret-onerileri');
export const getVeterinerRaporAylik = () => api.get('/veteriner/rapor/aylik');

export default api;