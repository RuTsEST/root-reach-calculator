import {Avatar, Badge, Fab} from "@mui/material";
import * as React from "react";
import {IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED} from "../constants";
import {FactionStatusOverlay} from "./FactionStatusOverlay";


const getFactionButtonColor = (faction) => {
    if (faction.status === IS_PICKED) {
        return "#4da251"
    }
    if (faction.status === IS_BANNED) {
        return "#b66969"
    }
}

export const ChooseFactionButton = ({faction, handleFactionClick, isBanMode}) => {
    // Shrink/gray only when pick mode disables the fab. In ban mode, keep full size
    // so "unavailable" factions still read as clickable ban targets.
    const isPickDisabled = !isBanMode && faction.status === IS_NOT_AVAILABLE;
    const widthAndHeight = isPickDisabled ? "4em" : "7em"
    const badgeFontSize = isPickDisabled ? "small" : "large";
    const opacity = isPickDisabled ? "50%" : "100%"
    const fabColor = getFactionButtonColor(faction);

    // Badge wraps Fab so ButtonBase overflow:hidden cannot clip the digits.
    // Modest translate keeps the number on the Fab corner (above the art, not under
    // neighboring fabs). zIndex keeps badges above later grid Fabs that would
    // otherwise paint over the overhang.
    return (
        <Badge
            overlap="circular"
            badgeContent={
                <Avatar sx={{width: "2em", height: "2em", fontSize: badgeFontSize, backgroundColor: fabColor}}>
                    {faction.reach}
                </Avatar>
            }
            sx={{
                "& .MuiBadge-badge": {
                    top: 0,
                    right: 0,
                    transform: "translate(35%, -35%)",
                    zIndex: 10,
                },
            }}
        >
            <Fab onClick={() => handleFactionClick(faction.name)}
                 value={faction.reach}
                 aria-label={faction.label}
                 sx={{width: widthAndHeight, height: widthAndHeight, opacity: opacity}}
                 disabled={isPickDisabled}
                 data-cy={faction.name}
            >
                <FactionStatusOverlay status={faction.status} />
                <Avatar
                    alt={faction.label}
                    sx={{width: "90%", height: "90%"}}
                    imgProps={{sx: {objectFit: "contain"}}}
                    src={faction.image}
                />
            </Fab>
        </Badge>
    )
}
