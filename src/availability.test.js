import { recomputeAvailability } from './availability';
import { createInitialFactions } from './data/factions';
import { IS_AVAILABLE, IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED } from './constants';

function withStatuses(overrides) {
    const factions = createInitialFactions();
    for (const [name, status] of Object.entries(overrides)) {
        factions[name] = { ...factions[name], status };
    }
    return factions;
}

describe('recomputeAvailability', () => {
    test('seat cap: with all seats filled, open factions become not available', () => {
        const factions = withStatuses({
            marquise: IS_PICKED,
            duchy: IS_PICKED,
            hundreds: IS_PICKED,
            eyrie: IS_PICKED,
        });
        const next = recomputeAvailability(factions, {
            playerCount: 4,
            requiredReach: 21,
        });
        expect(next.marquise.status).toBe(IS_PICKED);
        expect(next.corvid.status).toBe(IS_NOT_AVAILABLE);
        expect(next.alliance.status).toBe(IS_NOT_AVAILABLE);
    });

    test('special rules: vagabond2 blocked until vagabond1 is picked', () => {
        const empty = recomputeAvailability(createInitialFactions(), {
            playerCount: 4,
            requiredReach: 21,
        });
        expect(empty.vagabond2.status).toBe(IS_NOT_AVAILABLE);

        const withV1 = recomputeAvailability(
            withStatuses({ vagabond1: IS_PICKED }),
            { playerCount: 4, requiredReach: 21 }
        );
        expect(withV1.vagabond2.status).toBe(IS_AVAILABLE);
    });

    test('special rules: knaves and vagabonds mutually exclude', () => {
        const withKnaves = recomputeAvailability(
            withStatuses({ knaves: IS_PICKED }),
            { playerCount: 4, requiredReach: 21 }
        );
        expect(withKnaves.vagabond1.status).toBe(IS_NOT_AVAILABLE);
        expect(withKnaves.vagabond2.status).toBe(IS_NOT_AVAILABLE);

        const withVagabond = recomputeAvailability(
            withStatuses({ vagabond1: IS_PICKED }),
            { playerCount: 4, requiredReach: 21 }
        );
        expect(withVagabond.knaves.status).toBe(IS_NOT_AVAILABLE);
    });

    test('reach viability: low-reach picks gray out when threshold cannot be met', () => {
        // 4p needs 21+. After picking alliance (3) + cult (2) = 5, two seats left.
        // Even with the two strongest open factions, cult/alliance-style lows may fail.
        const factions = withStatuses({
            alliance: IS_PICKED,
            cult: IS_PICKED,
        });
        const next = recomputeAvailability(factions, {
            playerCount: 4,
            requiredReach: 21,
        });
        // Top remaining: marquise 10 + hundreds 9 = 19; 5+19=24 ≥ 21 → some available
        expect(next.marquise.status).toBe(IS_AVAILABLE);

        // Ban high-reach so remaining max cannot hit 21 from current 5.
        const bannedHigh = withStatuses({
            alliance: IS_PICKED,
            cult: IS_PICKED,
            marquise: IS_BANNED,
            hundreds: IS_BANNED,
            duchy: IS_BANNED,
            keepers: IS_BANNED,
            eyrie: IS_BANNED,
            lilypad: IS_BANNED,
        });
        const blocked = recomputeAvailability(bannedHigh, {
            playerCount: 4,
            requiredReach: 21,
        });
        expect(blocked.corvid.status).toBe(IS_NOT_AVAILABLE);
        expect(blocked.riverfolk.status).toBe(IS_NOT_AVAILABLE);
        expect(bannedHigh.marquise.status).toBe(IS_BANNED);
    });

    test('preserves picked and banned statuses', () => {
        const factions = withStatuses({
            marquise: IS_PICKED,
            alliance: IS_BANNED,
        });
        const next = recomputeAvailability(factions, {
            playerCount: 4,
            requiredReach: 21,
        });
        expect(next.marquise.status).toBe(IS_PICKED);
        expect(next.alliance.status).toBe(IS_BANNED);
    });

    test('does not mutate the input map', () => {
        const factions = withStatuses({ marquise: IS_PICKED });
        const before = factions.corvid.status;
        recomputeAvailability(factions, { playerCount: 4, requiredReach: 21 });
        expect(factions.corvid.status).toBe(before);
    });
});
