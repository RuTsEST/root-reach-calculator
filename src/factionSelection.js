import { IS_AVAILABLE, IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED } from './constants';

/**
 * Tap cycle: available → picked → banned → available.
 * Not-available cannot be picked (returns null); ban via long-press instead.
 */
export function nextStatusOnTap(currentStatus) {
    if (currentStatus === IS_AVAILABLE) return IS_PICKED;
    if (currentStatus === IS_PICKED) return IS_BANNED;
    if (currentStatus === IS_BANNED) return IS_AVAILABLE;
    if (currentStatus === IS_NOT_AVAILABLE) return null;
    return null;
}

/**
 * Long-press: ban if not already banned; clear banned back to available.
 * Works on available, picked, and not-available (prior ban affordance).
 */
export function nextStatusOnLongPress(currentStatus) {
    if (currentStatus === IS_BANNED) return IS_AVAILABLE;
    return IS_BANNED;
}
