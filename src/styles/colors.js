// 🎨 Agrolina - Marka Renk Sistemi
// Tek marka kimliği, tutarlı, olgun görünüm

export const colors = {
  primary: '#16a34a',
  primaryDark: '#15803d',
  primaryLight: '#dcfce7',
  primaryText: '#166534',

  secondary: '#f59e0b',
  secondaryLight: '#fef3c7',
  secondaryText: '#92400e',

  info: '#3b82f6',
  infoLight: '#eff6ff',
  infoText: '#1e40af',

  danger: '#ef4444',
  dangerDark: '#dc2626',
  dangerDarker: '#b91c1c',
  dangerLight: '#fef2f2',
  dangerText: '#991b1b',

  warning: '#f59e0b',
  warningLight: '#fffbeb',
  warningText: '#92400e',

  success: '#16a34a',
  successLight: '#dcfce7',
  successText: '#166534',

  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },

  bg: {
    main: '#f9fafb',
    card: '#ffffff',
    dark: '#18181b',
    darkNavy: '#18181b',
    green: '#dcfce7',
    lightGreen: '#dcfce7',
    orange: '#fef3c7',
    lightOrange: '#fffbeb',
    blue: '#eff6ff',
    lightBlue: '#eff6ff',
    red: '#fef2f2',
    purple: '#f5f3ff',
    gray: '#f4f4f5',
  },

  text: {
    primary: '#111827',
    secondary: '#6b7280',
    light: '#9ca3af',
    muted: '#d1d5db',
    white: '#ffffff',
  },

  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },

  status: {
    gebe: '#16a34a',
    sagmal: '#3b82f6',
    kuru: '#f59e0b',
    hasta: '#ef4444',
    belirsiz: '#71717a',
  },

  chart: {
    primary: '#16a34a',
    secondary: '#3b82f6',
    tertiary: '#f59e0b',
    quaternary: '#8b5cf6',
    line1: '#16a34a',
    line2: '#3b82f6',
    line3: '#f59e0b',
    area1: 'rgba(22, 163, 74, 0.2)',
    area2: 'rgba(59, 130, 246, 0.2)',
    grid: '#e5e7eb',
  },
};

// Gradient kullanma — düz renkler tercih. Geriye uyumluluk için tutuldu.
export const gradients = {
  primary: '#16a34a',
  primaryDark: '#16a34a',
  secondary: '#f59e0b',
  info: '#3b82f6',
  danger: '#ef4444',
  sidebar: '#18181b',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  round: '50%',
};

export const shadows = {
  sm: 'none',
  md: 'none',
  lg: 'none',
  xl: 'none',
  hover: 'none',
};

export const typography = {
  fontSize: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    huge: '32px',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const transitions = {
  fast: '0.15s ease',
  medium: '0.2s ease',
  slow: '0.3s ease',
};

export default {
  colors,
  gradients,
  spacing,
  borderRadius,
  shadows,
  typography,
  transitions,
};
