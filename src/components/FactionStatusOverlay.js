import {IS_BANNED, IS_PICKED} from "../constants";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import * as React from "react";

const overlaySx = {
    position: "absolute",
    zIndex: "1",
    width: "85%",
    height: "85%",
};

/** Solid check: human/locked pick kept across random-fill re-rolls. */
export const LockedPickOverlay = () => (
    <CheckCircleIcon
        color="success"
        data-cy="pick-locked"
        // Solid fill covers art more than the outline; keep it readable but see-through.
        sx={{ ...overlaySx, opacity: 0.85 }}
    />
);

/** Outline check: pick produced by the last random fill (cleared on re-roll). */
export const FillPickOverlay = () => (
    <CheckCircleOutlineIcon
        color="success"
        data-cy="pick-fill"
        sx={overlaySx}
    />
);

export const FactionStatusOverlay = ({status, isLockedPick = false}) => {
    switch (status) {
        case IS_PICKED:
            return isLockedPick ? <LockedPickOverlay /> : <FillPickOverlay />;
        case IS_BANNED:
            return (
                <NotInterestedOutlinedIcon
                    color="error"
                    sx={overlaySx}
                />
            );
        default:
            return (<></>);
    }
};
