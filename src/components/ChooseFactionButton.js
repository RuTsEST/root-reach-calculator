import {Avatar, Badge, Fab} from "@mui/material";
import * as React from "react";
import {IS_NOT_AVAILABLE} from "../constants";
import {FactionStatusOverlay} from "./FactionStatusOverlay";


export const ChooseFactionButton = ({faction, handleFactionClick}) => {
    const widthAndHeight = faction.status === IS_NOT_AVAILABLE ? "4em" : "7em"
    const badgeTopAndRight = faction.status === IS_NOT_AVAILABLE ? "0.5em" : "1em"
    const badgeFontSize = faction.status === IS_NOT_AVAILABLE ? "small" : "large";
    const opacity = faction.status === IS_NOT_AVAILABLE ? "50%" : "100%"

    return (
        <Fab onClick={() => handleFactionClick(faction.name)}
             value={faction.reach}
             sx={{width: widthAndHeight, height: widthAndHeight, opacity: opacity}}
             disabled={faction.status === IS_NOT_AVAILABLE}
             data-cy={faction.name}
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