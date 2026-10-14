import {Avatar, Box, Fab} from "@mui/material";
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
    const badgeSize = isPickDisabled ? 22 : 32;
    // Room for the half of the badge that sits outside the Fab circle.
    const badgeOverhang = badgeSize / 2;
    const opacity = isPickDisabled ? "50%" : "100%"
    const fabColor = getFactionButtonColor(faction);

    // Badge center sits on the Fab circle at ~2 o'clock (45°), so the Fab edge
    // bisects the reach number. Margin keeps that overhang inside the layout.
    return (
        <Box sx={{
            position: "relative",
            display: "inline-flex",
            flexShrink: 0,
            m: `${badgeOverhang}px`,
        }}>
            <Fab onClick={() => handleFactionClick(faction.name)}
                 value={faction.reach}
                 aria-label={faction.label}
                 sx={{
                     width: widthAndHeight,
                     height: widthAndHeight,
                     opacity: opacity,
                     zIndex: 0,
                 }}
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
            <Avatar
                aria-hidden
                sx={{
                    position: "absolute",
                    // (1 - cos45°)/2 ≈ 14.64% from top/right → NE point on the circle
                    top: "14.64%",
                    right: "14.64%",
                    transform: "translate(50%, -50%)",
                    width: badgeSize,
                    height: badgeSize,
                    fontSize: badgeFontSize,
                    lineHeight: 1,
                    backgroundColor: fabColor || "rgb(189, 189, 189)",
                    zIndex: 1,
                    pointerEvents: "none",
                }}
            >
                {faction.reach}
            </Avatar>
        </Box>
    )
}
