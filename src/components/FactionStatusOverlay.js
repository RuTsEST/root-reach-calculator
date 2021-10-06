import {IS_BANNED, IS_PICKED} from "../constants";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import * as React from "react";

export const FactionStatusOverlay = ({status}) => {
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