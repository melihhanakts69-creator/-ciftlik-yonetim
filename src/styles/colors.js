// 🎨 Çiftlik Yönetim Sistemi - Renk Paleti
// Tüm projede kullanılacak standart renkler

export const colors = {
  // Ana Renkler
  primary: '#4CAF50',      // Yeşil - Düve, İnek, Başarı
  secondary: '#FF9800',    // Turuncu - Buzağı, Tosun, Uyarı
  info: '#2196F3',         // Mavi - Detay, Bilgi
  danger: '#f44336',       // Kırmızı - Sil, Hata
  warning: '#FF9800',      // Turuncu - Uyarılar
  success: '#4CAF50',      // Yeşil - Başarılı işlemler

  // Arka Plan Renkleri
  bg: {
    main: '#F5F5F5',       // Ana sayfa arka planı
    card: '#FFFFFF',       // Kart arka planı
    dark: '#2C3E50',       // Koyu mod
    green: '#E8F5E9',      // Yeşil arka plan (gebe, aktif)
    lightGreen: '#F1F8F4', // Açık yeşil
    orange: '#FFF3E0',     // Turuncu arka plan (buzağı)
    lightOrange: '#FFF8F0',// Açık turuncu
    blue: '#E3F2FD',       // Mavi arka plan (bilgi)
    lightBlue: '#F0F7FF',  // Açık mavi
    red: '#FFEBEE',        // Kırmızı arka plan (uyarı)
    purple: '#F3E5F5',     // Mor arka plan (doğum, gebe)
    gray: '#FAFAFA'        // Gri arka plan
  },

  // Text Renkleri
  text: {
    primary: '#333333',    // Ana metin
    secondary: '#666666',  // İkincil metin
    light: '#999999',      // Açık metin
    white: '#FFFFFF',      // Beyaz metin
    muted: '#BBBBBB'       // Soluk metin
  },

  // Border Renkleri
  border: {
    light: '#e0e0e0',      // Açık kenarlık
    medium: '#cccccc',     // Orta kenarlık
    dark: '#999999'        // Koyu kenarlık
  },

  // Durum Renkleri (Hayvanlar için)
  status: {
    gebe: '#4CAF50',       // Gebe
    sagmal: '#2196F3',     // Sağmal
    kuru: '#FF9800',       // Kuru dönem
    hasta: '#f44336',      // Hasta
    belirsiz: '#9E9E9E'    // Belirsiz
  },

  // Grafik Renkleri
  chart: {
    primary: '#4CAF50',
    secondary: '#2196F3',
    tertiary: '#FF9800',
    quaternary: '#9C27B0',
    line1: '#4CAF50',
    line2: '#2196F3',
    line3: '#FF9800',
    area1: 'rgba(76, 175, 80, 0.2)',
    area2: 'rgba(33, 150, 243, 0.2)',
    grid: '#e0e0e0'
  }
};

// Gradient'ler
export const gradients = {
  primary: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
  primaryDark: 'linear-gradient(135deg, #1a5e1f 0%, #2e7d32 40%, #43a047 100%)', // Header, hero
  secondary: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
  info: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  danger: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
};

// Spacing (Boşluklar)
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px'
};

// Border Radius
export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  round: '50%'
};

// Shadows
export const shadows = {
  sm: '0 2px 4px rgba(0,0,0,0.1)',
  md: '0 2px 10px rgba(0,0,0,0.1)',
  lg: '0 4px 20px rgba(0,0,0,0.15)',
  xl: '0 8px 30px rgba(0,0,0,0.2)',
  hover: '0 8px 20px rgba(0,0,0,0.15)'
};

// Typography
export const typography = {
  fontSize: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    huge: '32px'
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};

// Transitions
export const transitions = {
  fast: '0.2s ease',
  medium: '0.3s ease',
  slow: '0.5s ease'
};

export default {
  colors,
  gradients,
  spacing,
  borderRadius,
  shadows,
  typography,
  transitions
};
