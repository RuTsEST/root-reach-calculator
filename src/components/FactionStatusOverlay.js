import {IS_BANNED, IS_PICKED} from "../constants";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import * as React from "react";

export const FactionStatusOverlay = ({status, locked = false}) => {
    let sx = {
        position: "absolute",
        zIndex: "1",
        width: "85%",
        height: "85%"
    }

    switch (status) {
        case IS_PICKED:
            // Solid = human/locked pick (kept on re-roll); outline = random-fill pick.
            return locked ? (
                <CheckCircleIcon
                    color="success"
                    data-cy="pick-locked"
                    // Solid fill covers art more than the outline; keep it readable but see-through.
                    sx={{ ...sx, opacity: 0.85 }}
                />
            ) : (
                <CheckCircleOutlineIcon
                    color="success"
                    data-cy="pick-fill"
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
