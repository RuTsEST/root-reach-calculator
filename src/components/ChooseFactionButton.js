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

export const ChooseFactionButton = ({faction, handleFactionClick, isBanMode, lockedPick = false}) => {
    // Shrink/gray only when pick mode disables the fab. In ban mode, keep full size
    // so "unavailable" factions still read as clickable ban targets.
    // Sizes come from CSS variables (see App.css) so short viewports can densify.
    const isPickDisabled = !isBanMode && faction.status === IS_NOT_AVAILABLE;
    const isPicked = faction.status === IS_PICKED;
    const ariaLabel = isPicked && lockedPick
        ? `${faction.label} (locked)`
        : faction.label;
    const widthAndHeight = isPickDisabled
        ? "var(--faction-fab-size-disabled)"
        : "var(--faction-fab-size)";
    const badgeSize = isPickDisabled
        ? "var(--faction-badge-size-disabled)"
        : "var(--faction-badge-size)";
    const badgeFontSize = isPickDisabled ? "0.75rem" : "1.05rem";
    // Room for the half of the badge that sits outside the Fab circle.
    const badgeOverhang = isPickDisabled
        ? "calc(var(--faction-badge-size-disabled) / 2)"
        : "calc(var(--faction-badge-size) / 2)";
    const opacity = isPickDisabled ? "50%" : "100%"
    const fabColor = getFactionButtonColor(faction);

    // Reach Avatar at ~2 o'clock, slightly outside the rim so the Fab edge
    // cuts the number ~half-in/half-out. Margin keeps the overhang in layout.
    // Short catalog label sits under the fab (always on; densify via CSS vars).
    return (
        <Box
            className={isPickDisabled ? "faction-cell faction-cell--disabled" : "faction-cell"}
            sx={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                maxWidth: "100%",
            }}
        >
            <Box sx={{
                position: "relative",
                display: "inline-flex",
                flexShrink: 0,
                m: badgeOverhang,
                mb: `calc(${badgeOverhang} * 0.35)`,
            }}>
                <Fab onClick={() => handleFactionClick(faction.name)}
                     value={faction.reach}
                     aria-label={ariaLabel}
                     sx={{
                         width: widthAndHeight,
                         height: widthAndHeight,
                         opacity: opacity,
                         zIndex: 0,
                     }}
                     disabled={isPickDisabled}
                     data-cy={faction.name}
                >
                    <FactionStatusOverlay
                        status={faction.status}
                        locked={isPicked && lockedPick}
                    />
                    <Avatar
                        alt=""
                        sx={{width: "90%", height: "90%"}}
                        imgProps={{sx: {objectFit: "contain"}}}
                        src={faction.image}
                    />
                </Fab>
                <Avatar
                    aria-hidden
                    sx={{
                        position: "absolute",
                        // Just outside the NE circumference so the curved Fab edge
                        // reads as cutting the badge roughly in half.
                        top: "12%",
                        right: "12%",
                        transform: "translate(50%, -50%)",
                        width: badgeSize,
                        height: badgeSize,
                        fontSize: badgeFontSize,
                        lineHeight: 1,
                        backgroundColor: fabColor || "var(--faction-badge-default)",
                        zIndex: 1,
                        pointerEvents: "none",
                    }}
                >
                    {faction.reach}
                </Avatar>
            </Box>
            <span className="faction-label" aria-hidden="true">
                {faction.label}
            </span>
        </Box>
    )
}
