import React, { createContext, useContext, useState, useEffect } from 'react';
import { colors } from '../styles/colors';

// Tema tanımları
export const themes = {
  light: {
    name: 'light',
    colors: {
      bgPrimary:    '#ffffff',
      bgSecondary:  '#f9fafb',
      bgTertiary:   '#f4f6f3',

      textPrimary:   '#111827',
      textSecondary: '#6b7280',
      textMuted:     '#9ca3af',

      primary:      colors.primary,        // #16a34a
      primaryDark:  colors.primaryDark,    // #15803d
      primaryLight: colors.primaryLight,   // #dcfce7

      success:  colors.success,            // #16a34a
      warning:  colors.warning,            // #f59e0b
      error:    colors.danger,             // #ef4444
      info:     colors.info,               // #3b82f6

      border:      '#e5e7eb',
      borderLight: '#f3f4f6',

      shadow:      'rgba(0, 0, 0, 0.08)',
      shadowLight: 'rgba(0, 0, 0, 0.04)',

      sidebarBg:   '#18181b',
      sidebarText: '#71717a',
    }
  },
  dark: {
    name: 'dark',
    colors: {
      bgPrimary:   '#18181b',
      bgSecondary: '#27272a',
      bgTertiary:  '#09090b',

      textPrimary:   '#f4f4f5',
      textSecondary: '#a1a1aa',
      textMuted:     '#71717a',

      primary:      colors.primary,        // #16a34a
      primaryDark:  colors.primaryDark,
      primaryLight: 'rgba(22, 163, 74, 0.15)',

      success:  colors.success,
      warning:  colors.warning,
      error:    colors.danger,
      info:     colors.info,

      border:      '#3f3f46',
      borderLight: '#27272a',

      shadow:      'rgba(0, 0, 0, 0.4)',
      shadowLight: 'rgba(0, 0, 0, 0.25)',

      sidebarBg:   '#09090b',
      sidebarText: '#52525b',
    }
  }
};

// Context oluştur
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
    // localStorage'dan tema tercihini al
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem('agrolina-theme');
        if (savedTheme && themes[savedTheme]) {
            return savedTheme;
        }
        // Sistem tercihine bak
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };

    const [themeName, setThemeName] = useState(getInitialTheme);

    // Tema değişikliğinde localStorage güncelle
    useEffect(() => {
        localStorage.setItem('agrolina-theme', themeName);
        document.documentElement.setAttribute('data-theme', themeName);
    }, [themeName]);

    const toggleTheme = () => {
        setThemeName(prev => prev === 'light' ? 'dark' : 'light');
    };

    const value = {
        theme: themes[themeName],
        themeName,
        toggleTheme,
        isDark: themeName === 'dark'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
