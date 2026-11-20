import {
    AVOID_DUPLICATE_ATTEMPTS,
    canCompleteRandomFill,
    combinations,
    fillDisabledReason,
    isLegalPickSet,
    listValidCompletions,
    pickRandomCompletion,
    sameFillSet,
    statusesToFillArgs,
    totalReachForNames,
} from './randomFill';
import { IS_BANNED, IS_PICKED, IS_AVAILABLE } from './constants';

describe('isLegalPickSet', () => {
    test('rejects vagabond2 without vagabond1', () => {
        expect(isLegalPickSet(['marquise', 'vagabond2'])).toBe(false);
    });

    test('allows vagabond1 + vagabond2', () => {
        expect(isLegalPickSet(['vagabond1', 'vagabond2', 'marquise'])).toBe(true);
    });

    test('rejects knaves with any vagabond', () => {
        expect(isLegalPickSet(['knaves', 'vagabond1'])).toBe(false);
        expect(isLegalPickSet(['knaves', 'vagabond2', 'vagabond1'])).toBe(false);
    });
});

describe('combinations', () => {
    test('returns all k-subsets', () => {
        expect(combinations(['a', 'b', 'c'], 2)).toEqual([
            ['a', 'b'],
            ['a', 'c'],
            ['b', 'c'],
        ]);
    });
});

describe('listValidCompletions', () => {
    test('empty board 4p finds completions meeting 21+ reach', () => {
        const completions = listValidCompletions({
            lockedPicks: [],
            banned: [],
            playerCount: 4,
            requiredReach: 21,
        });
        expect(completions.length).toBeGreaterThan(0);
        for (const fill of completions) {
            expect(fill).toHaveLength(4);
            expect(isLegalPickSet(fill)).toBe(true);
            expect(totalReachForNames(fill)).toBeGreaterThanOrEqual(21);
        }
    });

    test('keeps locked picks and only fills remaining seats', () => {
        const completions = listValidCompletions({
            lockedPicks: ['marquise', 'duchy'],
            banned: [],
            playerCount: 4,
            requiredReach: 21,
        });
        expect(completions.length).toBeGreaterThan(0);
        for (const fill of completions) {
            expect(fill).toHaveLength(2);
            expect(fill).not.toContain('marquise');
            expect(fill).not.toContain('duchy');
            const full = ['marquise', 'duchy', ...fill];
            expect(totalReachForNames(full)).toBeGreaterThanOrEqual(21);
            expect(isLegalPickSet(full)).toBe(true);
        }
    });

    test('respects bans — banned factions never appear', () => {
        const banned = ['marquise', 'hundreds', 'duchy', 'keepers', 'eyrie', 'lilypad'];
        const completions = listValidCompletions({
            lockedPicks: [],
            banned,
            playerCount: 4,
            requiredReach: 21,
        });
        for (const fill of completions) {
            for (const name of banned) {
                expect(fill).not.toContain(name);
            }
        }
    });

    test('impossible when high-reach factions are banned', () => {
        const banned = [
            'marquise', 'hundreds', 'duchy', 'keepers', 'eyrie', 'lilypad',
            'riverfolk', 'vagabond1', 'twilight', 'knaves',
        ];
        const completions = listValidCompletions({
            lockedPicks: [],
            banned,
            playerCount: 4,
            requiredReach: 21,
        });
        expect(completions).toEqual([]);
        expect(canCompleteRandomFill({
            lockedPicks: [],
            banned,
            playerCount: 4,
            requiredReach: 21,
        })).toBe(false);
    });
});

describe('sameFillSet', () => {
    test('ignores order', () => {
        expect(sameFillSet(['a', 'b'], ['b', 'a'])).toBe(true);
        expect(sameFillSet(['a', 'b'], ['a', 'c'])).toBe(false);
    });
});

describe('pickRandomCompletion', () => {
    test('uses rng to select among completions', () => {
        const args = {
            lockedPicks: ['marquise'],
            banned: [],
            playerCount: 2,
            requiredReach: 17,
        };
        const completions = listValidCompletions(args);
        expect(completions.length).toBeGreaterThan(1);

        const first = pickRandomCompletion(args, () => 0);
        const last = pickRandomCompletion(args, () => 0.999999);
        expect(first.ok).toBe(true);
        expect(last.ok).toBe(true);
        expect(first.fillNames).toEqual(completions[0]);
        expect(last.fillNames).toEqual(completions[completions.length - 1]);
    });

    test('returns reason when impossible', () => {
        const result = pickRandomCompletion({
            lockedPicks: ['cult', 'alliance'],
            banned: [
                'marquise', 'hundreds', 'duchy', 'keepers', 'eyrie', 'lilypad',
                'riverfolk', 'vagabond1', 'corvid', 'twilight', 'knaves', 'vagabond2',
            ],
            playerCount: 4,
            requiredReach: 21,
        });
        expect(result.ok).toBe(false);
        expect(result.reason).toMatch(/no valid faction spread/i);
    });

    test('retries when duplicate of previous fill', () => {
        const args = {
            lockedPicks: ['marquise'],
            banned: [],
            playerCount: 2,
            requiredReach: 17,
        };
        const completions = listValidCompletions(args);
        expect(completions.length).toBeGreaterThan(1);

        const previous = completions[0];
        const draws = [0, 0.999999];
        let call = 0;
        const rng = () => draws[Math.min(call++, draws.length - 1)];

        const result = pickRandomCompletion(args, rng, {
            excludeFillNames: previous,
            maxAttempts: AVOID_DUPLICATE_ATTEMPTS,
        });

        expect(result.ok).toBe(true);
        expect(sameFillSet(result.fillNames, previous)).toBe(false);
        expect(result.fillNames).toEqual(completions[completions.length - 1]);
        expect(call).toBe(2);
    });

    test('allows same fill if it is the only option', () => {
        const catalog = {
            marquise: { name: 'marquise', reach: 10 },
            duchy: { name: 'duchy', reach: 8 },
        };
        const args = {
            lockedPicks: [],
            banned: [],
            playerCount: 2,
            requiredReach: 17,
            catalog,
        };
        const completions = listValidCompletions(args);
        expect(completions).toHaveLength(1);

        let calls = 0;
        const rng = () => {
            calls += 1;
            return 0;
        };

        const result = pickRandomCompletion(args, rng, {
            excludeFillNames: completions[0],
            maxAttempts: 5,
        });

        expect(result.ok).toBe(true);
        expect(result.fillNames).toEqual(completions[0]);
        expect(calls).toBe(5);
    });
});

describe('fillDisabledReason / statusesToFillArgs', () => {
    test('all seats filled (manual) disables with clear reason', () => {
        const reason = fillDisabledReason({
            lockedPicks: ['marquise', 'duchy', 'hundreds', 'eyrie'],
            banned: [],
            playerCount: 4,
            requiredReach: 21,
            fillGeneratedNames: [],
        });
        expect(reason).toMatch(/all seats are filled/i);
    });

    test('statusesToFillArgs treats fill-generated picks as unlocked', () => {
        const factions = {
            marquise: { status: IS_PICKED },
            duchy: { status: IS_PICKED },
            hundreds: { status: IS_PICKED },
            eyrie: { status: IS_PICKED },
            alliance: { status: IS_BANNED },
            corvid: { status: IS_AVAILABLE },
        };
        const args = statusesToFillArgs(factions, 4, 21, ['hundreds', 'eyrie']);
        expect(args.lockedPicks).toEqual(['marquise', 'duchy']);
        expect(args.banned).toEqual(['alliance']);
        expect(args.playerCount).toBe(4);
    });
});
