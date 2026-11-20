const STORAGE_KEY = 'root-reach-calculator-session';

const DEFAULT_SESSION = {
    playerCountKey: 'player4',
    isBanMode: false,
    factionStatuses: {},
};

function readPlayerCountKey(parsed) {
    if (typeof parsed.playerCountKey === 'string') return parsed.playerCountKey;
    // Migrate legacy selectedValue from earlier sessions.
    if (typeof parsed.selectedValue === 'string') return parsed.selectedValue;
    return DEFAULT_SESSION.playerCountKey;
}

export function loadSession() {
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_SESSION };
        const parsed = JSON.parse(raw);
        return {
            playerCountKey: readPlayerCountKey(parsed),
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
        // Persist only the new key; drop legacy selectedValue on write.
        delete next.selectedValue;
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
