import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Her istekte token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getProfile = () => api.get('/auth/me');

// İNEKLER
export const getInekler = () => api.get('/inekler');
export const createInek = (data) => api.post('/inekler', data);
export const updateInek = (id, data) => api.put(`/inekler/${id}`, data);
export const deleteInek = (id) => api.delete(`/inekler/${id}`);

// BUZAĞILAR
export const getBuzagilar = () => api.get('/buzagilar');
export const createBuzagi = (data) => api.post('/buzagilar', data);
export const deleteBuzagi = (id) => api.delete(`/buzagilar/${id}`);

// DÜVELER
export const getDuveler = () => api.get('/duveler');
export const createDuve = (data) => api.post('/duveler', data);
export const deleteDuve = (id) => api.delete(`/duveler/${id}`);

// SÜT KAYITLARI
export const getSutKayitlari = () => api.get('/sut-kayitlari');
export const createSutKaydi = (data) => api.post('/sut-kayitlari', data);
export const deleteSutKaydi = (id) => api.delete(`/sut-kayitlari/${id}`);

// YEM DEPOSU
export const getYemStok = () => api.get('/yemler/stok');
export const createYemStok = (data) => api.post('/yemler/stok', data);
export const getYemHareketler = () => api.get('/yemler/hareketler');
export const createYemHareket = (data) => api.post('/yemler/hareket', data);

export default api;