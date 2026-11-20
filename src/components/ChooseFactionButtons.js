import {Box} from "@mui/material";
import * as React from 'react';
import {IS_AVAILABLE, IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED} from "../constants";
import {createInitialFactions} from "../data/factions";
import {loadSession, saveSession} from "../sessionStorage";
import {recomputeAvailability} from "../availability";
import {
    fillDisabledReason,
    pickRandomCompletion,
    statusesToFillArgs,
    totalReachForNames,
} from "../randomFill";
import {ChooseFactionButton} from "./ChooseFactionButton";

const VALID_STATUSES = new Set([IS_PICKED, IS_BANNED, IS_AVAILABLE, IS_NOT_AVAILABLE]);

function factionsFromSession() {
    const factions = createInitialFactions();
    const { factionStatuses } = loadSession();
    for (const key of Object.keys(factionStatuses)) {
        if (factions[key] && VALID_STATUSES.has(factionStatuses[key])) {
            // Only restore explicit picks/bans; availability is recomputed below.
            if (factionStatuses[key] === IS_PICKED || factionStatuses[key] === IS_BANNED) {
                factions[key].status = factionStatuses[key];
            }
        }
    }
    return factions;
}

function persistFactionStatuses(factions) {
    const factionStatuses = {};
    for (const key of Object.keys(factions)) {
        const status = factions[key].status;
        if (status === IS_PICKED || status === IS_BANNED) {
            factionStatuses[key] = status;
        }
    }
    saveSession({ factionStatuses });
}

function fillStateFromFactions(factions, playerCount, requiredReach, fillGeneratedNames) {
    const args = statusesToFillArgs(
        factions,
        playerCount,
        requiredReach,
        fillGeneratedNames
    );
    const reason = fillDisabledReason({
        ...args,
        fillGeneratedNames,
    });
    return {
        disabled: Boolean(reason),
        reason: reason || '',
    };
}

export const ChooseFactionButtons = ({
    playerCount,
    setReach,
    requiredReach,
    isBanMode,
    fillRequestId = 0,
    onFillStateChange,
}) => {
    const [factions, setFactions] = React.useState(() => factionsFromSession());
    // Picks created by the last Fill; re-roll clears only these and keeps manual picks.
    const [fillGeneratedNames, setFillGeneratedNames] = React.useState([]);
    // Seed with the current id so a remount (e.g. reset) does not re-apply an
    // already-handled fillRequestId from the parent.
    const lastHandledFillRequest = React.useRef(fillRequestId);

    React.useEffect(() => {
        setFactions((prev) =>
            recomputeAvailability(prev, { playerCount, requiredReach })
        );
    }, [playerCount, requiredReach]);

    React.useEffect(() => {
        if (!onFillStateChange) return;
        onFillStateChange(
            fillStateFromFactions(factions, playerCount, requiredReach, fillGeneratedNames)
        );
    }, [factions, fillGeneratedNames, onFillStateChange, playerCount, requiredReach]);

    const handleFactionClick = (factionName) => {
        let newFactions = {...factions};
        const currentStatus = factions[factionName].status;

        if (isBanMode) {
            newFactions[factionName].status = (currentStatus === IS_BANNED) ? IS_AVAILABLE : IS_BANNED;
        } else {
            newFactions[factionName].status = (currentStatus === IS_PICKED) ? IS_AVAILABLE : IS_PICKED;
        }

        // Manual edits: drop this name from the last fill set (it is now user-controlled).
        const nextFillGenerated = fillGeneratedNames.filter((name) => name !== factionName);

        newFactions = recomputeAvailability(newFactions, { playerCount, requiredReach });
        setFactions(newFactions);
        setFillGeneratedNames(nextFillGenerated);
        persistFactionStatuses(newFactions);
    }

    React.useEffect(() => {
        if (!fillRequestId || fillRequestId === lastHandledFillRequest.current) {
            return;
        }
        lastHandledFillRequest.current = fillRequestId;

        const args = statusesToFillArgs(
            factions,
            playerCount,
            requiredReach,
            fillGeneratedNames
        );
        const result = pickRandomCompletion(args, Math.random, {
            excludeFillNames: fillGeneratedNames,
        });
        if (!result.ok) {
            if (onFillStateChange) {
                onFillStateChange(
                    fillStateFromFactions(
                        factions,
                        playerCount,
                        requiredReach,
                        fillGeneratedNames
                    )
                );
            }
            return;
        }

        let newFactions = { ...factions };
        // Clear previous fill-generated picks so re-roll only reshuffles unlocked seats.
        for (const name of fillGeneratedNames) {
            if (newFactions[name] && newFactions[name].status === IS_PICKED) {
                newFactions[name] = { ...newFactions[name], status: IS_AVAILABLE };
            }
        }
        for (const name of result.fillNames) {
            if (newFactions[name]) {
                newFactions[name] = { ...newFactions[name], status: IS_PICKED };
            }
        }

        newFactions = recomputeAvailability(newFactions, { playerCount, requiredReach });
        setFactions(newFactions);
        setFillGeneratedNames(result.fillNames);
        persistFactionStatuses(newFactions);
    }, [
        fillRequestId,
        factions,
        fillGeneratedNames,
        playerCount,
        requiredReach,
        onFillStateChange,
    ]);

    React.useEffect(() => {
        const pickedNames = Object.keys(factions).filter(
            (name) => factions[name].status === IS_PICKED
        );
        setReach(totalReachForNames(pickedNames));
    }, [setReach, factions])

    const fillGeneratedSet = new Set(fillGeneratedNames);

    const factionArray = Object.values(factions);
    const lastRowCount = factionArray.length % 3;
    const lastRowStart = lastRowCount > 0 ? factionArray.length - lastRowCount : factionArray.length;

    return (
        <Box className="faction-grid">
            {factionArray.map((faction, index) => {
                const isLastRow = lastRowCount > 0 && index >= lastRowStart;
                const posInLastRow = isLastRow ? index - lastRowStart : 0;
                const gridColumn = isLastRow ? `${posInLastRow * 2 + 2} / span 2` : 'span 2';
                // Human picks (not from the last fill) stay locked across re-rolls.
                const lockedPick =
                    faction.status === IS_PICKED && !fillGeneratedSet.has(faction.name);

                return (
                    <Box key={index} sx={{ display: "flex", justifyContent: "center", alignItems: "center", gridColumn }}>
                        <ChooseFactionButton
                            handleFactionClick={handleFactionClick}
                            faction={faction}
                            isBanMode={isBanMode}
                            lockedPick={lockedPick}
                        />
                    </Box>
                );
            })}
        </Box>
    );
};
