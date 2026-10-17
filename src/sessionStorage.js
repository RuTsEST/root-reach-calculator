const STORAGE_KEY = 'root-reach-calculator-session';

const DEFAULT_SESSION = {
    selectedValue: 'player4',
    isBanMode: false,
    factionStatuses: {},
};

export function loadSession() {
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_SESSION };
        const parsed = JSON.parse(raw);
        return {
            selectedValue: typeof parsed.selectedValue === 'string'
                ? parsed.selectedValue
                : DEFAULT_SESSION.selectedValue,
            isBanMode: Boolean(parsed.isBanMode),
            factionStatuses:
                parsed.factionStatuses && typeof parsed.factionStatuses === 'object'
                    ? parsed.factionStatuses
                    : {},
        };
    } catch {
        return { ...DEFAULT_SESSION };
    }
}

export function saveSession(partial) {
    try {
        const current = loadSession();
        const next = { ...current, ...partial };
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // Ignore quota / private-mode failures
    }
}

export function clearSession() {
    try {
        window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // Ignore
    }
}

export { STORAGE_KEY, DEFAULT_SESSION };
