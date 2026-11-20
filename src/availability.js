import { IS_AVAILABLE, IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED } from './constants';
import { isLegalPickSet, totalReachForNames } from './randomFill';

/**
 * Recompute available / not-available statuses from picks, bans, seat count,
 * special rules, and reach viability. Picked and banned statuses are preserved.
 */
export function recomputeAvailability(factions, { playerCount, requiredReach }) {
    const next = { ...factions };
    const pickedNames = Object.keys(next).filter(
        (name) => next[name].status === IS_PICKED
    );

    applySeatCap(next, pickedNames.length, playerCount);
    if (pickedNames.length >= playerCount) {
        return next;
    }

    applySpecialRulesAndReach(next, pickedNames, playerCount, requiredReach);
    return next;
}

/** When every seat is taken, gray out everything that is not picked or banned. */
function applySeatCap(factions, pickedCount, playerCount) {
    if (pickedCount < playerCount) return;

    for (const name of Object.keys(factions)) {
        const status = factions[name].status;
        if (status !== IS_PICKED && status !== IS_BANNED) {
            factions[name] = { ...factions[name], status: IS_NOT_AVAILABLE };
        }
    }
}

/**
 * For each open faction: block by special rules (via isLegalPickSet), else
 * mark available only if picking it can still meet requiredReach with the
 * strongest remaining seats.
 */
function applySpecialRulesAndReach(factions, pickedNames, playerCount, requiredReach) {
    const openByReach = Object.values(factions)
        .filter((faction) => faction.status !== IS_PICKED && faction.status !== IS_BANNED)
        .sort((a, b) => b.reach - a.reach);

    const seatsLeft = playerCount - pickedNames.length;
    const currentReach = totalReachForNames(pickedNames);

    for (const name of Object.keys(factions)) {
        if (factions[name].status === IS_PICKED || factions[name].status === IS_BANNED) {
            continue;
        }

        if (!isLegalPickSet([...pickedNames, name])) {
            factions[name] = { ...factions[name], status: IS_NOT_AVAILABLE };
            continue;
        }

        const others = openByReach.filter((faction) => faction.name !== name);
        let maxReach = factions[name].reach;
        for (let i = 0; i < seatsLeft - 1; i++) {
            if (others[i]) {
                maxReach += others[i].reach;
            }
        }

        const status =
            currentReach + maxReach < requiredReach ? IS_NOT_AVAILABLE : IS_AVAILABLE;
        factions[name] = { ...factions[name], status };
    }
}
