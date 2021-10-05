import {Grid} from "@mui/material";
import eyrieImage from "../faction-images/eyrie.png";
import corvidImage from "../faction-images/corvid.png";
import allianceImage from "../faction-images/alliance.png";
import cultImage from "../faction-images/cult.png";
import duchyImage from "../faction-images/duchy.png";
import riverfolkImage from "../faction-images/riverfolk.png";
import marquiseImage from "../faction-images/marquise.png";
import vagabondImage from "../faction-images/vagabond.png";
import * as React from 'react';
import {IS_AVAILABLE, IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED} from "../constants";
import {ChooseFactionButton} from "./ChooseFactionButton";

export const ChooseFactionButtons = ({playerCount, setReach}) => {
    const [factionsPicked, setFactionsPicked] = React.useState(0);
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
            status: IS_AVAILABLE
        },
        riverfolk: {
            name: "riverfolk",
            image: riverfolkImage,
            reach: 5,
            status: IS_AVAILABLE
        },
        cult: {
            name: "cult",
            image: cultImage,
            reach: 2,
            status: IS_AVAILABLE
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
            image: vagabondImage,
            reach: 2,
            status: IS_NOT_AVAILABLE
        },
    });

    React.useEffect(() => {
        console.log('factionsPicked', factionsPicked);
    }, [factionsPicked])

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

        setFactions(newFactions);
    }

    React.useEffect(() => {
        const reach = Object.values(factions)
            .filter((faction) => faction.status === IS_PICKED)
            .map((faction) => faction.reach)
            .reduce((total, currentFactionReach) => total + currentFactionReach, 0);

        const newFactionsPicked = Object.values(factions)
            .filter((faction) => faction.status === IS_PICKED)
            .length

        setReach(reach);
        setFactionsPicked(newFactionsPicked);
    }, [factions])

    return (
        <Grid container columns={{xs: 3}} rowSpacing={6}>
            {Object.values(factions).map((faction, index) => (
                <Grid
                    item
                    xs={1}
                    sx={
                        {
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
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