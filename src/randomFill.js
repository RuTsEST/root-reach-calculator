import { FACTION_CATALOG } from './data/factions';
import { IS_BANNED, IS_PICKED } from './constants';

/**
 * Special-rules + reach checks for a complete picked set (names).
 * Mirrors ChooseFactionButtons constraints for vagabond2 / knaves.
 */
export function isLegalPickSet(pickedNames) {
    const set = new Set(pickedNames);
    if (set.has('vagabond2') && !set.has('vagabond1')) {
        return false;
    }
    if (set.has('knaves') && (set.has('vagabond1') || set.has('vagabond2'))) {
        return false;
    }
    return true;
}

export function totalReachForNames(pickedNames, catalog = FACTION_CATALOG) {
    let total = 0;
    for (const name of pickedNames) {
        const faction = catalog[name];
        if (faction) total += faction.reach;
    }
    return total;
}

/** Combinations of `arr` of exact length `k`. */
export function combinations(arr, k) {
    if (k < 0 || k > arr.length) return [];
    if (k === 0) return [[]];
    const result = [];
    const recurse = (start, chosen) => {
        if (chosen.length === k) {
            result.push(chosen.slice());
            return;
        }
        const need = k - chosen.length;
        for (let i = start; i <= arr.length - need; i++) {
            chosen.push(arr[i]);
            recurse(i + 1, chosen);
            chosen.pop();
        }
    };
    recurse(0, []);
    return result;
}

/**
 * List every fill combo (names to newly pick) that completes locked picks to
 * exactly `playerCount` factions meeting `requiredReach` and special rules.
 * Banned and already-locked names are excluded from the candidate pool.
 */
export function listValidCompletions({
    lockedPicks,
    banned,
    playerCount,
    requiredReach,
    catalog = FACTION_CATALOG,
}) {
    const locked = [...lockedPicks];
    const bannedSet = new Set(banned);
    const lockedSet = new Set(locked);

    if (locked.length > playerCount) {
        return [];
    }
    if (!isLegalPickSet(locked)) {
        return [];
    }

    const seatsToFill = playerCount - locked.length;
    const candidates = Object.keys(catalog).filter(
        (name) => !lockedSet.has(name) && !bannedSet.has(name)
    );

    if (seatsToFill === 0) {
        const reach = totalReachForNames(locked, catalog);
        return reach >= requiredReach ? [[]] : [];
    }

    if (candidates.length < seatsToFill) {
        return [];
    }

    const valid = [];
    for (const combo of combinations(candidates, seatsToFill)) {
        const full = locked.concat(combo);
        if (!isLegalPickSet(full)) continue;
        if (totalReachForNames(full, catalog) < requiredReach) continue;
        valid.push(combo);
    }
    return valid;
}

export function canCompleteRandomFill(args) {
    return listValidCompletions(args).length > 0;
}

/** Order-independent equality for two fill name lists. */
export function sameFillSet(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    const other = new Set(b);
    for (const name of a) {
        if (!other.has(name)) return false;
    }
    return true;
}

/** Bounded resamples when avoiding a duplicate of the previous fill. */
export const AVOID_DUPLICATE_ATTEMPTS = 8;

/**
 * Pure random choice among legal completions.
 * Returns { ok: true, fillNames } or { ok: false, reason }.
 * `rng` is optional () => [0,1) for tests.
 * If `options.excludeFillNames` matches the first sample, resample up to
 * `options.maxAttempts` (default AVOID_DUPLICATE_ATTEMPTS) times; accept a
 * duplicate only when every attempt lands on the same set (e.g. sole option).
 */
export function pickRandomCompletion(args, rng = Math.random, options = {}) {
    const {
        excludeFillNames = null,
        maxAttempts = AVOID_DUPLICATE_ATTEMPTS,
    } = options;
    const completions = listValidCompletions(args);
    if (completions.length === 0) {
        return {
            ok: false,
            reason: 'No valid faction spread for this table',
            fillNames: [],
        };
    }

    const attempts = Math.max(1, maxAttempts);
    let fillNames = completions[Math.floor(rng() * completions.length)];

    if (excludeFillNames && excludeFillNames.length > 0) {
        for (let i = 1; i < attempts; i++) {
            if (!sameFillSet(fillNames, excludeFillNames)) break;
            fillNames = completions[Math.floor(rng() * completions.length)];
        }
    }

    return {
        ok: true,
        reason: '',
        fillNames,
    };
}

/** Derive locked picks / bans / fill-baseline from faction status map. */
export function statusesToFillArgs(factions, playerCount, requiredReach, fillGeneratedNames) {
    const fillSet = new Set(fillGeneratedNames || []);
    const lockedPicks = [];
    const banned = [];

    for (const key of Object.keys(factions)) {
        const status = factions[key].status;
        if (status === IS_BANNED) {
            banned.push(key);
            continue;
        }
        if (status === IS_PICKED && !fillSet.has(key)) {
            lockedPicks.push(key);
        }
    }

    return { lockedPicks, banned, playerCount, requiredReach };
}

export function fillDisabledReason({
    lockedPicks,
    banned,
    playerCount,
    requiredReach,
    catalog = FACTION_CATALOG,
    fillGeneratedNames = [],
}) {
    const seatsToFill = playerCount - lockedPicks.length;
    if (seatsToFill < 0) {
        return 'Too many factions picked for player count';
    }
    if (seatsToFill === 0 && (!fillGeneratedNames || fillGeneratedNames.length === 0)) {
        return 'All seats are filled';
    }
    if (!canCompleteRandomFill({ lockedPicks, banned, playerCount, requiredReach, catalog })) {
        return 'No valid faction spread for this table';
    }
    return '';
}
