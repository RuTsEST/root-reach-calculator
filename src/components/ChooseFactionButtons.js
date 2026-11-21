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
import {nextStatusOnLongPress, nextStatusOnTap} from "../factionSelection";
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
    actionsRef,
    onFillStateChange,
}) => {
    const [factions, setFactions] = React.useState(() => factionsFromSession());
    // Picks created by the last Fill; re-roll clears only these and keeps manual picks.
    const [fillGeneratedNames, setFillGeneratedNames] = React.useState([]);

    const factionsRef = React.useRef(factions);
    const fillGeneratedNamesRef = React.useRef(fillGeneratedNames);
    factionsRef.current = factions;
    fillGeneratedNamesRef.current = fillGeneratedNames;

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

    const applyFactionStatus = (factionName, nextStatus) => {
        if (nextStatus == null) return;

        let newFactions = {
            ...factions,
            [factionName]: { ...factions[factionName], status: nextStatus },
        };

        // Manual edits: drop this name from the last fill set (it is now user-controlled).
        const nextFillGenerated = fillGeneratedNames.filter((name) => name !== factionName);

        newFactions = recomputeAvailability(newFactions, { playerCount, requiredReach });
        setFactions(newFactions);
        setFillGeneratedNames(nextFillGenerated);
        persistFactionStatuses(newFactions);
    };

    const onFactionTap = (factionName) => {
        applyFactionStatus(factionName, nextStatusOnTap(factions[factionName].status));
    };

    const onFactionLongPress = (factionName) => {
        applyFactionStatus(factionName, nextStatusOnLongPress(factions[factionName].status));
    };

    const runFill = React.useCallback(() => {
        const currentFactions = factionsRef.current;
        const currentFillGenerated = fillGeneratedNamesRef.current;
        const args = statusesToFillArgs(
            currentFactions,
            playerCount,
            requiredReach,
            currentFillGenerated
        );
        const result = pickRandomCompletion(args, Math.random, {
            excludeFillNames: currentFillGenerated,
        });
        if (!result.ok) {
            if (onFillStateChange) {
                onFillStateChange(
                    fillStateFromFactions(
                        currentFactions,
                        playerCount,
                        requiredReach,
                        currentFillGenerated
                    )
                );
            }
            return;
        }

        let newFactions = { ...currentFactions };
        // Clear previous fill-generated picks so re-roll only reshuffles unlocked seats.
        for (const name of currentFillGenerated) {
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
    }, [playerCount, requiredReach, onFillStateChange]);

    const runReset = React.useCallback(() => {
        const cleared = recomputeAvailability(createInitialFactions(), {
            playerCount,
            requiredReach,
        });
        setFactions(cleared);
        setFillGeneratedNames([]);
        persistFactionStatuses(cleared);
    }, [playerCount, requiredReach]);

    React.useImperativeHandle(actionsRef, () => ({
        fill: runFill,
        reset: runReset,
    }), [runFill, runReset]);

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
                const isLockedPick =
                    faction.status === IS_PICKED && !fillGeneratedSet.has(faction.name);

                return (
                    <Box key={index} sx={{ display: "flex", justifyContent: "center", alignItems: "center", gridColumn }}>
                        <ChooseFactionButton
                            onFactionTap={onFactionTap}
                            onFactionLongPress={onFactionLongPress}
                            faction={faction}
                            isLockedPick={isLockedPick}
                        />
                    </Box>
                );
            })}
        </Box>
    );
};
