import {Avatar, Badge, Fab} from "@mui/material";
import * as React from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import {IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED} from "../constants";

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

const handleFactionClick = (clickedFaction) => {
    console.log(clickedFaction);
}

export const ChooseFactionButton = ({faction}) => {
    const widthAndHeight = faction.status === IS_NOT_AVAILABLE ? "4em" : "7em"
    const badgeTopAndRight = faction.status === IS_NOT_AVAILABLE ? "0.5em" : "1em"
    const badgeFontSize = faction.status === IS_NOT_AVAILABLE ? "small" : "large";
    const opacity = faction.status === IS_NOT_AVAILABLE ? "50%" : "100%"

    return (
        <Fab onClick={() => handleFactionClick(faction.name)}
             value={faction.reach}
             sx={{width: widthAndHeight, height: widthAndHeight, opacity: opacity}}
             disabled={faction.status === IS_NOT_AVAILABLE}
        >
            <Badge
                badgeContent={
                    <Avatar
                        sx={{width: "2em", height: "2em", fontSize: badgeFontSize}}
                    >
                        {faction.reach}
                    </Avatar>
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