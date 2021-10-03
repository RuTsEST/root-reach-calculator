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

export const ChooseFactionButtons = () => {

    let IS_PICKED = 'IS_PICKED';
    let IS_BANNED = 'IS_BANNED';
    let IS_AVAILABLE = 'IS_AVAILABLE';
    let IS_NOT_AVAILABLE = 'IS_NOT_AVAILABLE';

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

    const handleFactionClick = (clickedFaction) => {
        console.log(clickedFaction);
    }

    const FactionStatusOverlay = ({status}) => {
        console.log(status);

        let sx = {
            position: "absolute",
            zIndex: "1",
            width: "85%",
            height: "85%"
        }

        switch (status) {
            case IS_PICKED:
                return (
                    <CheckCircleOutlineIcon
                        color="success"
                        sx={sx}
                    />
                )
            case IS_BANNED:
                return (
                    <NotInterestedOutlinedIcon
                        color="error"
                        sx={sx}
                    />
                )
            default:
                return (<></>)
        }
    }

    const ChooseFactionButton = ({faction}) => {
        const widthAndHeight = faction.status === IS_NOT_AVAILABLE ? "4em" : "7em"
        const badgeTopAndRight = faction.status === IS_NOT_AVAILABLE ? "0.5em" : "1em"
        const badgeFontSize = faction.status === IS_NOT_AVAILABLE ? "small" : "large";

        return (
            <Fab onClick={() => handleFactionClick(faction.name)}
                 value={faction.reach}
                 sx={{width: widthAndHeight, height: widthAndHeight}}
                 disabled={faction.status === IS_NOT_AVAILABLE}
            >
                <Badge
                    badgeContent={
                        <Avatar
                            sx={{width: "2em", height: "2em", fontSize: badgeFontSize}}
                        >{faction.reach}</Avatar>
                    }
                    sx={
                        {
                            "& .MuiBadge-badge": {
                                top: badgeTopAndRight,
                                right: badgeTopAndRight,
                            },
                            width: "100%",
                            height: "100%",
                            alignItems: "center",
                            justifyContent: "center"
                        }
                    }
                >
                    <FactionStatusOverlay status={faction.status}/>
                    <Avatar
                        sx={{width: "90%", height: "90%"}}
                        imgProps={{sx: {objectFit: "contain"}}}
                        src={faction.image}
                    />
                </Badge>
            </Fab>
        )
    }

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