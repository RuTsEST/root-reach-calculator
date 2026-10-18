import {
    THEME_STORAGE_KEY,
    getSystemPrefersDark,
    loadThemeOverride,
    resolveMode,
    saveThemeOverride,
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

test('resolveMode follows system when no override', () => {
    expect(resolveMode(null, false)).toBe('light');
    expect(resolveMode(null, true)).toBe('dark');
    expect(resolveMode(undefined, true)).toBe('dark');
});

test('resolveMode prefers explicit override over system', () => {
    expect(resolveMode('light', true)).toBe('light');
    expect(resolveMode('dark', false)).toBe('dark');
});

test('loadThemeOverride returns null when unset', () => {
    expect(loadThemeOverride()).toBeNull();
});

test('saveThemeOverride persists light and dark', () => {
    saveThemeOverride('dark');
    expect(window.sessionStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(loadThemeOverride()).toBe('dark');

    saveThemeOverride('light');
    expect(loadThemeOverride()).toBe('light');
});

test('saveThemeOverride(null) clears stored override', () => {
    saveThemeOverride('dark');
    saveThemeOverride(null);
    expect(window.sessionStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(loadThemeOverride()).toBeNull();
});

test('loadThemeOverride ignores invalid stored values', () => {
    window.sessionStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    expect(loadThemeOverride()).toBeNull();
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
