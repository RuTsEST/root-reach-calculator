import {Grid} from "@mui/material";
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
import * as React from 'react';
import {IS_AVAILABLE, IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED} from "../constants";
import {ChooseFactionButton} from "./ChooseFactionButton";

export const ChooseFactionButtons = ({playerCount, setReach, requiredReach}) => {
    const [factions, setFactions] = React.useState({
        marquise: {
            name: "marquise",
            image: marquiseImage,
            reach: 10,
            status: IS_AVAILABLE
        },
        eyrie: {
            name: "eyrie",
            image: eyrieImage,
            reach: 7,
            status: IS_AVAILABLE
        },
        alliance: {
            name: "alliance",
            image: allianceImage,
            reach: 3,
            status: IS_AVAILABLE
        },
        vagabond1: {
            name: "vagabond1",
            image: vagabondImage,
            reach: 5,
            status: IS_NOT_AVAILABLE
        },
        riverfolk: {
            name: "riverfolk",
            image: riverfolkImage,
            reach: 5,
            status: IS_NOT_AVAILABLE
        },
        cult: {
            name: "cult",
            image: cultImage,
            reach: 2,
            status: IS_NOT_AVAILABLE
        },
        corvid: {
            name: "corvid",
            image: corvidImage,
            reach: 3,
            status: IS_AVAILABLE
        },
        duchy: {
            name: "duchy",
            image: duchyImage,
            reach: 8,
            status: IS_AVAILABLE
        },
        vagabond2: {
            name: "vagabond2",
            image: vagabond2Image,
            reach: 2,
            status: IS_NOT_AVAILABLE
        },
        hundreds: {
            name: "hundreds",
            image: hundredsImage,
            reach: 9,
            status: IS_AVAILABLE
        },
        keepers: {
            name: "keepers",
            image: keepersImage,
            reach: 8,
            status: IS_AVAILABLE
        }
    });

    React.useEffect(() => {
        const recalculatedFactions = setAvailableFactions(factions);

        setFactions(recalculatedFactions);
    }, [requiredReach])

    const setAvailableFactions = (previousFactions) => {
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
    }

    const handleFactionClick = (factionName) => {
        let newFactions = {...factions};

        switch (factions[factionName].status) {
            case IS_AVAILABLE:
                newFactions[factionName].status = IS_PICKED
                break;
            case IS_PICKED:
                newFactions[factionName].status = IS_BANNED
                break;
            case IS_BANNED:
                newFactions[factionName].status = IS_AVAILABLE
                break;
            default:
                break;
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

    return (
        <Grid container columns={{xs: 3}} rowSpacing={6} justifyContent={'center'}>
            {Object.values(factions).map((faction, index) => (
                <Grid
                    item
                    xs={1}
                    sx={
                        {
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "9em"
                        }
                    }
                    key={index}
                >
                    <ChooseFactionButton
                        handleFactionClick={handleFactionClick}
                        faction={faction}
                    />
                </Grid>
            ))}
        </Grid>
    );
};