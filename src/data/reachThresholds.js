// Reach thresholds keyed by player selection id (from PlayerCountButtons).
// Values match Law of Root §5.2.1 Viable Reach Sums.
export const REACH_THRESHOLDS = {
    player2: { requiredReach: 17, playerCount: 2 },
    player3: { requiredReach: 18, playerCount: 3 },
    player4: { requiredReach: 21, playerCount: 4 },
    player5: { requiredReach: 25, playerCount: 5 },
    player6: { requiredReach: 28, playerCount: 6 },
};

export const DEFAULT_SELECTION = 'player4';
