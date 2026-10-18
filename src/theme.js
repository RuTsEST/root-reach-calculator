import { createTheme } from '@mui/material/styles';

export const THEME_STORAGE_KEY = 'root-reach-calculator-theme';

/** Light palette matches MUI defaults used in production today. */
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
    },
});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
    },
});

export function loadThemeOverride() {
    try {
        const raw = window.sessionStorage.getItem(THEME_STORAGE_KEY);
        if (raw === 'light' || raw === 'dark') return raw;
        return null;
    } catch {
        return null;
    }
}

export function saveThemeOverride(mode) {
    try {
        if (mode === 'light' || mode === 'dark') {
            window.sessionStorage.setItem(THEME_STORAGE_KEY, mode);
        } else {
            window.sessionStorage.removeItem(THEME_STORAGE_KEY);
        }
    } catch {
        // Ignore quota / private-mode failures
    }
}

export function getSystemPrefersDark() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveMode(override, systemPrefersDark) {
    if (override === 'light' || override === 'dark') return override;
    return systemPrefersDark ? 'dark' : 'light';
}

export function themeForMode(mode) {
    return mode === 'dark' ? darkTheme : lightTheme;
}
