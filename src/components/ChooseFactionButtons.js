import {Box} from "@mui/material";
import eyrieImage from "../faction-images/eyrie.png";
import corvidImage from "../faction-images/corvid.png";
import allianceImage from "../faction-images/alliance.png";
import cultImage from "../faction-images/cult.png";
import duchyImage from "../faction-images/duchy.png";
import riverfolkImage from "../faction-images/riverfolk.png";
import marquiseImage from "../faction-images/marquise.png";
import vagabondImage from "../faction-images/vagabond.png";
import vagabond2Image from "../faction-images/vagabond2.png";
import hundredsImage from "../faction-images/hundreds.png";
import keepersImage from "../faction-images/keepers.png";
import lilypadImage from "../faction-images/lilypad.png";
import twilightImage from "../faction-images/twilight.png";
import knavesImage from "../faction-images/knaves.png";
import * as React from 'react';
import {IS_AVAILABLE, IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED} from "../constants";
import {ChooseFactionButton} from "./ChooseFactionButton";

export const ChooseFactionButtons = ({playerCount, setReach, requiredReach, isBanMode}) => {
    const [factions, setFactions] = React.useState({
        marquise: {
            name: "marquise",
            label: "Marquise",
            image: marquiseImage,
            reach: 10,
            status: IS_AVAILABLE
        },
        eyrie: {
            name: "eyrie",
            label: "Eyrie",
            image: eyrieImage,
            reach: 7,
            status: IS_AVAILABLE
        },
        alliance: {
            name: "alliance",
            label: "Alliance",
            image: allianceImage,
            reach: 3,
            status: IS_AVAILABLE
        },
        vagabond1: {
            name: "vagabond1",
            label: "Vagabond",
            image: vagabondImage,
            reach: 5,
            status: IS_NOT_AVAILABLE
        },
        riverfolk: {
            name: "riverfolk",
            label: "Riverfolk",
            image: riverfolkImage,
            reach: 5,
            status: IS_NOT_AVAILABLE
        },
        cult: {
            name: "cult",
            label: "Cult",
            image: cultImage,
            reach: 2,
            status: IS_NOT_AVAILABLE
        },
        corvid: {
            name: "corvid",
            label: "Corvid",
            image: corvidImage,
            reach: 3,
            status: IS_AVAILABLE
        },
        duchy: {
            name: "duchy",
            label: "Duchy",
            image: duchyImage,
            reach: 8,
            status: IS_AVAILABLE
        },
        vagabond2: {
            name: "vagabond2",
            label: "Vagabond 2",
            image: vagabond2Image,
            reach: 2,
            status: IS_NOT_AVAILABLE
        },
        hundreds: {
            name: "hundreds",
            label: "Hundreds",
            image: hundredsImage,
            reach: 9,
            status: IS_AVAILABLE
        },
        keepers: {
            name: "keepers",
            label: "Keepers",
            image: keepersImage,
            reach: 8,
            status: IS_AVAILABLE
        },
        lilypad: {
            name: "lilypad",
            label: "Lilypad",
            image: lilypadImage,
            reach: 7,
            status: IS_AVAILABLE
        },
        twilight: {
            name: "twilight",
            label: "Twilight",
            image: twilightImage,
            reach: 4,
            status: IS_AVAILABLE
        },
        knaves: {
            name: "knaves",
            label: "Knaves",
            image: knavesImage,
            reach: 4,
            status: IS_AVAILABLE
        }
    });

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

    const handleFactionClick = (factionName) => {
        let newFactions = {...factions};
        const currentStatus = factions[factionName].status;

        if (isBanMode) {
            newFactions[factionName].status = (currentStatus === IS_BANNED) ? IS_AVAILABLE : IS_BANNED;
        } else {
            newFactions[factionName].status = (currentStatus === IS_PICKED) ? IS_AVAILABLE : IS_PICKED;
        }

        newFactions = setAvailableFactions(newFactions);
        setFactions(newFactions);
    }

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
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridAutoRows: '1fr', flex: 1 }}>
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
