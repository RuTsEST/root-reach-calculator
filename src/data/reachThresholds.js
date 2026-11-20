// Reach thresholds keyed by player-count selection id (player2…player6).
// Values match Law of Root §5.2.1 Viable Reach Sums.
export const REACH_THRESHOLDS = {
    player2: { requiredReach: 17, playerCount: 2 },
    player3: { requiredReach: 18, playerCount: 3 },
    player4: { requiredReach: 21, playerCount: 4 },
    player5: { requiredReach: 25, playerCount: 5 },
    player6: { requiredReach: 28, playerCount: 6 },
};

export const DEFAULT_SELECTION = 'player4';

/** Build session/UI key from a player count (2–6). */
export function playerCountKeyFromCount(count) {
    return `player${count}`;
}

/** Parse player2…player6 key to a number; default 4 for unknown. */
export function playerCountFromKey(key) {
    if (typeof key === 'string' && key.startsWith('player')) {
        const n = Number(key.slice('player'.length));
        if (n >= 2 && n <= 6) return n;
    }
    return 4;
}
