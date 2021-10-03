import {Avatar, Badge, Fab, Grid} from "@mui/material";
import eyrieImage from "../faction-images/eyrie.png";
import corvidImage from "../faction-images/corvid.png";
import allianceImage from "../faction-images/alliance.png";
import cultImage from "../faction-images/cult.png";
import duchyImage from "../faction-images/duchy.png";
import riverfolkImage from "../faction-images/riverfolk.png";
import marquiseImage from "../faction-images/marquise.png";
import vagabondImage from "../faction-images/vagabond.png";
import * as React from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NotInterestedOutlinedIcon from '@mui/icons-material/NotInterestedOutlined';
import {IS_AVAILABLE, IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED} from "../constants";
import {ChooseFactionButton} from "./ChooseFactionButton";

export const ChooseFactionButtons = () => {

    const [factions, setFactions] = React.useState({
        marquise: {name: "marquise", image: marquiseImage, reach: 10},
        eyrie: {name: "eyrie", image: eyrieImage, reach: 7, status: IS_PICKED},
        alliance: {name: "alliance", image: allianceImage, reach: 3, status: IS_BANNED},
        vagabond1: {name: "vagabond1", image: vagabondImage, reach: 5, status: IS_AVAILABLE},
        riverfolk: {name: "riverfolk", image: riverfolkImage, reach: 5, status: IS_NOT_AVAILABLE},
        cult: {name: "cult", image: cultImage, reach: 2},
        corvid: {name: "corvid", image: corvidImage, reach: 3},
        duchy: {name: "duchy", image: duchyImage, reach: 8},
        vagabond2: {name: "vagabond2", image: vagabondImage, reach: 2},
    });

    return (
        <Grid container columns={{xs: 3}} rowSpacing={6}>
            {Object.values(factions).map((faction) => (
                <Grid item xs={1} sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <ChooseFactionButton faction={faction}/>
                </Grid>
            ))}
        </Grid>
    );
};