import React, { createContext, useContext, useState, useEffect } from 'react';

// Tema tanımları
export const themes = {
    light: {
        name: 'light',
        colors: {
            // Backgrounds
            bgPrimary: '#ffffff',
            bgSecondary: '#f8f9fa',
            bgTertiary: '#f0f0f0',

            // Text
            textPrimary: '#1a1a1a',
            textSecondary: '#666666',
            textMuted: '#999999',

            // Brand
            primary: '#4CAF50',
            primaryDark: '#45a049',
            primaryLight: '#e8f5e9',

            // Status
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#f44336',
            info: '#2196F3',

            // Border
            border: '#e0e0e0',
            borderLight: '#f0f0f0',

            // Shadow
            shadow: 'rgba(0, 0, 0, 0.1)',
            shadowLight: 'rgba(0, 0, 0, 0.05)',

            // Sidebar
            sidebarBg: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
            sidebarText: '#a8a8b3',
        }
    },
    dark: {
        name: 'dark',
        colors: {
            // Backgrounds
            bgPrimary: '#1a1a2e',
            bgSecondary: '#16213e',
            bgTertiary: '#0f0f1a',

            // Text
            textPrimary: '#ffffff',
            textSecondary: '#a8a8b3',
            textMuted: '#666666',

            // Brand
            primary: '#4CAF50',
            primaryDark: '#45a049',
            primaryLight: 'rgba(76, 175, 80, 0.2)',

            // Status
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#f44336',
            info: '#2196F3',

            // Border
            border: '#2a2a40',
            borderLight: '#252535',

            // Shadow
            shadow: 'rgba(0, 0, 0, 0.3)',
            shadowLight: 'rgba(0, 0, 0, 0.2)',

            // Sidebar
            sidebarBg: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
            sidebarText: '#888888',
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
