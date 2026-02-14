import axios from 'axios';

// Production'da kesinlikle Render URL'ini kullan
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://ciftlik-yonetim.onrender.com/api'
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
});

// Her istekte token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔒 401 hatalarında otomatik token yenileme
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 hatası ve refresh denemesi değilse
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Refresh endpoint'ine yapılan istekse logout yap
      if (originalRequest.url?.includes('/auth/refresh')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Zaten refresh yapılıyorsa bekle
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        processQueue(null, data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

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

export default api;