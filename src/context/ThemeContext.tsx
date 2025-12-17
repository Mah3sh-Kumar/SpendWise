import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColor, Theme } from '../types';
import { LIGHT_THEME, DARK_THEME, THEME_COLORS } from '../constants';

interface ThemeContextType {
    theme: Theme;
    darkMode: boolean;
    themeColor: ThemeColor;
    isLoaded: boolean;
    toggleDarkMode: (value?: boolean) => void;
    setThemeColor: (color: ThemeColor) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [themeColor, setThemeColorState] = useState<ThemeColor>('emerald');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadThemeSettings();
    }, []);

    // Load theme settings from storage
    const loadThemeSettings = async () => {
        try {
            const [savedDarkMode, savedThemeColor] = await Promise.all([
                AsyncStorage.getItem('spendwise_theme_mode'),
                AsyncStorage.getItem('spendwise_theme_color'),
            ]);

            if (savedDarkMode !== null) {
                const isDark = savedDarkMode === 'dark';
                setDarkMode(isDark);
            }
            if (savedThemeColor && Object.keys(THEME_COLORS).includes(savedThemeColor)) {
                setThemeColorState(savedThemeColor as ThemeColor);
            }
        } catch (error) {
            console.error('Failed to load theme settings:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    // Toggle dark mode
    const toggleDarkMode = (value?: boolean) => {
        const newValue = value !== undefined ? value : !darkMode;
        setDarkMode(newValue);
        AsyncStorage.setItem('spendwise_theme_mode', newValue ? 'dark' : 'light')
            .catch(err => console.error('Failed to save dark mode:', err));
    };

    // Update theme color
    const updateThemeColor = (color: ThemeColor) => {
        setThemeColorState(color);
        AsyncStorage.setItem('spendwise_theme_color', color)
            .catch(err => console.error('Failed to save theme color:', err));
    };

    // Create theme object
    // Create a darker version of the primary color
    const primaryColor = THEME_COLORS[themeColor];
    const primaryDark = primaryColor.replace('#', '');
    const r = parseInt(primaryDark.substring(0, 2), 16);
    const g = parseInt(primaryDark.substring(2, 4), 16);
    const b = parseInt(primaryDark.substring(4, 6), 16);
    const darkerPrimary = `#${Math.floor(r * 0.8).toString(16).padStart(2, '0')}${Math.floor(g * 0.8).toString(16).padStart(2, '0')}${Math.floor(b * 0.8).toString(16).padStart(2, '0')}`;

    const baseTheme = darkMode ? DARK_THEME : LIGHT_THEME;
    const theme: Theme = {
        colors: {
            ...baseTheme.colors,
            primary: primaryColor,
            primaryDark: darkerPrimary,
            success: primaryColor, // Use the selected theme color for success messages
        },
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            darkMode,
            themeColor,
            isLoaded,
            toggleDarkMode,
            setThemeColor: updateThemeColor,
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
