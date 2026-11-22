import {Avatar, Box, Fab} from "@mui/material";
import * as React from "react";
import {IS_BANNED, IS_NOT_AVAILABLE, IS_PICKED} from "../constants";
import {FactionStatusOverlay} from "./FactionStatusOverlay";

const LONG_PRESS_MS = 500;

const getFactionButtonColor = (faction) => {
    if (faction.status === IS_PICKED) {
        return "#4da251"
    }
    if (faction.status === IS_BANNED) {
        return "#b66969"
    }
}

export const ChooseFactionButton = ({
    faction,
    onFactionTap,
    onFactionLongPress,
    isLockedPick = false,
}) => {
    // Gray/shrink not-available so illegal picks read as blocked; keep pointer
    // events so long-press can still ban (prior ban affordance).
    // Sizes come from CSS variables (see App.css) so short viewports can densify.
    // Outer fab slot always reserves full fab + badge overhang so disabled (smaller)
    // fabs do not collapse row height or shift neighboring rows.
    const isUnavailable = faction.status === IS_NOT_AVAILABLE;
    const isPicked = faction.status === IS_PICKED;
    const ariaLabel = isPicked && isLockedPick
        ? `${faction.label} (locked)`
        : faction.label;
    const widthAndHeight = isUnavailable
        ? "var(--faction-fab-size-disabled)"
        : "var(--faction-fab-size)";
    const badgeSize = isUnavailable
        ? "var(--faction-badge-size-disabled)"
        : "var(--faction-badge-size)";
    const badgeFontSize = isUnavailable ? "0.75rem" : "1.05rem";
    const opacity = isUnavailable ? "50%" : "100%"
    const fabColor = getFactionButtonColor(faction);

    const longPressTimerRef = React.useRef(null);
    const longPressFiredRef = React.useRef(false);
    const activePointerIdRef = React.useRef(null);

    const clearLongPressTimer = React.useCallback(() => {
        if (longPressTimerRef.current != null) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    React.useEffect(() => () => clearLongPressTimer(), [clearLongPressTimer]);

    const handlePointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        longPressFiredRef.current = false;
        activePointerIdRef.current = event.pointerId;
        clearLongPressTimer();
        // Keep receiving events if the pointer drifts slightly off the fab.
        if (typeof event.currentTarget.setPointerCapture === 'function') {
            try {
                event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
                // Ignore capture failures (unsupported / already released).
            }
        }
        longPressTimerRef.current = setTimeout(() => {
            longPressFiredRef.current = true;
            longPressTimerRef.current = null;
            onFactionLongPress(faction.name);
        }, LONG_PRESS_MS);
    };

    const handlePointerEnd = (event) => {
        if (
            activePointerIdRef.current != null
            && event.pointerId !== activePointerIdRef.current
        ) {
            return;
        }
        activePointerIdRef.current = null;
        clearLongPressTimer();
    };

    const handleClick = () => {
        if (longPressFiredRef.current) {
            longPressFiredRef.current = false;
            return;
        }
        onFactionTap(faction.name);
    };

    const handleContextMenu = (event) => {
        event.preventDefault();
    };

    // Reach Avatar at ~2 o'clock on the visual fab rim; short catalog label sits
    // under the fixed-size slot (always on; densify via CSS vars).
    return (
        <Box
            className={isUnavailable ? "faction-cell faction-cell--disabled" : "faction-cell"}
            sx={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                maxWidth: "100%",
            }}
        >
            <Box className="faction-fab-slot">
                <Box className="faction-fab-visual" sx={{ position: "relative", display: "inline-flex" }}>
                    <Fab
                        onClick={handleClick}
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerEnd}
                        onPointerCancel={handlePointerEnd}
                        onContextMenu={handleContextMenu}
                        value={faction.reach}
                        aria-label={ariaLabel}
                        aria-disabled={isUnavailable || undefined}
                        sx={{
                             width: widthAndHeight,
                             height: widthAndHeight,
                             opacity: opacity,
                             zIndex: 0,
                             touchAction: 'manipulation',
                             userSelect: 'none',
                         }}
                         data-cy={faction.name}
                    >
                        <FactionStatusOverlay
                            status={faction.status}
                            isLockedPick={isPicked && isLockedPick}
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
            </Box>
            <span className="faction-label" aria-hidden="true">
                {faction.label}
            </span>
        </Box>
    )
}
