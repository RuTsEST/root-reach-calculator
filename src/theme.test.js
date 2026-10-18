import {
    THEME_STORAGE_KEY,
    getSystemPrefersDark,
    loadThemePreference,
    nextThemePreference,
    resolveMode,
    saveThemePreference,
    themeForMode,
} from './theme';

function mockMatchMedia(matchesDark) {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)' ? matchesDark : false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }));
}

beforeEach(() => {
    window.sessionStorage.clear();
    mockMatchMedia(false);
});

test('default preference is system when storage is empty', () => {
    expect(loadThemePreference()).toBe('system');
});

test('resolveMode follows system when preference is system', () => {
    expect(resolveMode('system', false)).toBe('light');
    expect(resolveMode('system', true)).toBe('dark');
    expect(resolveMode(null, true)).toBe('dark');
});

test('resolveMode prefers explicit light/dark over system', () => {
    expect(resolveMode('light', true)).toBe('light');
    expect(resolveMode('dark', false)).toBe('dark');
});

test('saveThemePreference persists light and dark', () => {
    saveThemePreference('dark');
    expect(window.sessionStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(loadThemePreference()).toBe('dark');

    saveThemePreference('light');
    expect(loadThemePreference()).toBe('light');
});

test('saveThemePreference(system) clears storage so default is system', () => {
    saveThemePreference('dark');
    saveThemePreference('system');
    expect(window.sessionStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(loadThemePreference()).toBe('system');
});

test('loadThemePreference ignores invalid stored values', () => {
    window.sessionStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    expect(loadThemePreference()).toBe('system');
});

test('nextThemePreference cycles system → light → dark → system', () => {
    expect(nextThemePreference('system')).toBe('light');
    expect(nextThemePreference('light')).toBe('dark');
    expect(nextThemePreference('dark')).toBe('system');
});

test('getSystemPrefersDark reads matchMedia', () => {
    mockMatchMedia(true);
    expect(getSystemPrefersDark()).toBe(true);
    mockMatchMedia(false);
    expect(getSystemPrefersDark()).toBe(false);
});

test('themeForMode returns matching palette mode', () => {
    expect(themeForMode('light').palette.mode).toBe('light');
    expect(themeForMode('dark').palette.mode).toBe('dark');
});
