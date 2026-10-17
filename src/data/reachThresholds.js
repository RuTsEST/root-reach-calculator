// Reach thresholds keyed by player/bot selection id (from PlayerCountButtons).
// Clockwork values are unofficial estimates based on feel, not official rules.
export const REACH_THRESHOLDS = {
    player2: { requiredReach: 17, playerCount: 2 },
    player3: { requiredReach: 18, playerCount: 3 },
    player4: { requiredReach: 21, playerCount: 4 },
    player5: { requiredReach: 25, playerCount: 5 },
    player6: { requiredReach: 28, playerCount: 6 },

    '1clockwork1': { requiredReach: 8, playerCount: 1 },
    '1clockwork2': { requiredReach: 12, playerCount: 2 },
    '1clockwork3': { requiredReach: 14, playerCount: 3 },
    '1clockwork4': { requiredReach: 16, playerCount: 4 },

    '2clockwork1': { requiredReach: 9, playerCount: 1 },
    '2clockwork2': { requiredReach: 14, playerCount: 2 },
    '2clockwork3': { requiredReach: 18, playerCount: 3 },
    '2clockwork4': { requiredReach: 21, playerCount: 4 },
};

export const DEFAULT_SELECTION = 'player4';
