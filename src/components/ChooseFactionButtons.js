import {Box} from "@mui/material";
import * as React from 'react';
import {IS_AVAILABLE, IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED} from "../constants";
import {createInitialFactions} from "../data/factions";
import {loadSession, saveSession} from "../sessionStorage";
import {
    fillDisabledReason,
    pickRandomCompletion,
    statusesToFillArgs,
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

    const setAvailableFactions = React.useCallback((previousFactions) => {
        const factions = {...previousFactions};
        const pickedFactions = Object.values(factions).filter((faction) => faction.status === IS_PICKED)

        // If the number of picked factions >= number of players in game then set every not picked and not banned faction as disabled
        if (pickedFactions.length >= playerCount) {

            for (const key in factions) {
                if (!(factions[key].status === IS_PICKED || factions[key].status === IS_BANNED)) {
                    factions[key].status = IS_NOT_AVAILABLE
                }
            }

            return factions;
        }

        // Filter out picked and banned factions
        let sortedFactionArray = Object.values(factions)
            .filter((faction) => !(faction.status === IS_PICKED || faction.status === IS_BANNED))
            .sort((faction1, faction2) => {
                if (faction1.reach > faction2.reach) {
                    return -1;
                }
                if (faction1.reach < faction2.reach) {
                    return 1;
                }
                return 0;
            });

        const playersStillToPick = playerCount - pickedFactions.length;

        const reach = Object.values(factions)
            .filter((faction) => faction.status === IS_PICKED)
            .map((faction) => faction.reach)
            .reduce((total, currentFactionReach) => total + currentFactionReach, 0);

        for (const factionsKey in factions) {
            if (factions[factionsKey].status === IS_PICKED || factions[factionsKey].status === IS_BANNED) {
                continue;
            }

            if (factions[factionsKey].name === "vagabond2" && (factions.vagabond1.status !== IS_PICKED)){
                factions[factionsKey].status = IS_NOT_AVAILABLE;
                continue
            }

            // Knaves of the Deepwood use Vagabond components and cannot be played with any Vagabond
            if (factions[factionsKey].name === "knaves" && (factions.vagabond1.status === IS_PICKED || factions.vagabond2.status === IS_PICKED)) {
                factions[factionsKey].status = IS_NOT_AVAILABLE;
                continue
            }
            if ((factions[factionsKey].name === "vagabond1" || factions[factionsKey].name === "vagabond2") && factions.knaves.status === IS_PICKED) {
                factions[factionsKey].status = IS_NOT_AVAILABLE;
                continue
            }

            let sortedFactionArrayWithoutFaction = sortedFactionArray.filter((faction) => faction.name !== factionsKey)
            let maxReachForFaction = factions[factionsKey].reach;
            for (let i = 0; i < playersStillToPick - 1; i++) {
                if (sortedFactionArrayWithoutFaction[i]) {
                    maxReachForFaction += sortedFactionArrayWithoutFaction[i].reach
                }
            }

            if (reach + maxReachForFaction < requiredReach) {
                factions[factionsKey].status = IS_NOT_AVAILABLE
            } else {
                factions[factionsKey].status = IS_AVAILABLE
            }
        }

        return factions;
    }, [playerCount, requiredReach]);

    React.useEffect(() => {
        setFactions(prev => setAvailableFactions(prev));
    }, [setAvailableFactions]);

    const reportFillState = React.useCallback((nextFactions, nextFillGenerated) => {
        if (!onFillStateChange) return;
        const args = statusesToFillArgs(
            nextFactions,
            playerCount,
            requiredReach,
            nextFillGenerated
        );
        const reason = fillDisabledReason({
            ...args,
            fillGeneratedNames: nextFillGenerated,
        });
        onFillStateChange({
            disabled: Boolean(reason),
            reason: reason || '',
        });
    }, [onFillStateChange, playerCount, requiredReach]);

    React.useEffect(() => {
        reportFillState(factions, fillGeneratedNames);
    }, [factions, fillGeneratedNames, reportFillState]);

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

        newFactions = setAvailableFactions(newFactions);
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
        const result = pickRandomCompletion(args);
        if (!result.ok) {
            reportFillState(factions, fillGeneratedNames);
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

        newFactions = setAvailableFactions(newFactions);
        setFactions(newFactions);
        setFillGeneratedNames(result.fillNames);
        persistFactionStatuses(newFactions);
    }, [
        fillRequestId,
        factions,
        fillGeneratedNames,
        playerCount,
        requiredReach,
        setAvailableFactions,
        reportFillState,
    ]);

    React.useEffect(() => {
        const reach = Object.values(factions)
            .filter((faction) => faction.status === IS_PICKED)
            .map((faction) => faction.reach)
            .reduce((total, currentFactionReach) => total + currentFactionReach, 0);

        setReach(reach);
    }, [setReach, factions])

    const factionArray = Object.values(factions);
    const lastRowCount = factionArray.length % 3;
    const lastRowStart = lastRowCount > 0 ? factionArray.length - lastRowCount : factionArray.length;

    return (
        <Box className="faction-grid">
            {factionArray.map((faction, index) => {
                const isLastRow = lastRowCount > 0 && index >= lastRowStart;
                const posInLastRow = isLastRow ? index - lastRowStart : 0;
                const gridColumn = isLastRow ? `${posInLastRow * 2 + 2} / span 2` : 'span 2';

                return (
                    <Box key={index} sx={{ display: "flex", justifyContent: "center", alignItems: "center", gridColumn }}>
                        <ChooseFactionButton
                            handleFactionClick={handleFactionClick}
                            faction={faction}
                            isBanMode={isBanMode}
                        />
                    </Box>
                );
            })}
        </Box>
    );
};
