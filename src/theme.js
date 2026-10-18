import { createTheme } from '@mui/material/styles';

export const THEME_STORAGE_KEY = 'root-reach-calculator-theme';

/** Explicit preference: light, dark, or follow OS (default). */
export const THEME_PREFERENCES = ['system', 'light', 'dark'];

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

/**
 * Default is system (follow prefers-color-scheme).
 * Missing / invalid storage → 'system'.
 */
export function loadThemePreference() {
    try {
        const raw = window.sessionStorage.getItem(THEME_STORAGE_KEY);
        if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
        return 'system';
    } catch {
        return 'system';
    }
}

export function saveThemePreference(preference) {
    try {
        if (preference === 'light' || preference === 'dark') {
            window.sessionStorage.setItem(THEME_STORAGE_KEY, preference);
        } else {
            // system = default: clear so empty session matches "follow OS"
            window.sessionStorage.removeItem(THEME_STORAGE_KEY);
        }
    } catch {
        // Ignore quota / private-mode failures
    }
}

export function nextThemePreference(current) {
    const i = THEME_PREFERENCES.indexOf(current);
    const idx = i < 0 ? 0 : i;
    return THEME_PREFERENCES[(idx + 1) % THEME_PREFERENCES.length];
}

export function getSystemPrefersDark() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveMode(preference, systemPrefersDark) {
    if (preference === 'light' || preference === 'dark') return preference;
    return systemPrefersDark ? 'dark' : 'light';
}

export function themeForMode(mode) {
    return mode === 'dark' ? darkTheme : lightTheme;
}
