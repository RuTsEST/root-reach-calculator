import * as React from 'react';
import {Stack, ToggleButton, ToggleButtonGroup} from "@mui/material";

export const PlayerCountButtons = ({requiredReach, handlePlayerCountButtonPress}) => {
    return (
        <Stack justifyContent="center">
            <h4>Players</h4>
            <ToggleButtonGroup exclusive value={requiredReach} onChange={handlePlayerCountButtonPress}>
                <ToggleButton value={17}>2</ToggleButton>
                <ToggleButton value={18}>3</ToggleButton>
                <ToggleButton value={21}>4</ToggleButton>
                <ToggleButton value={25}>5</ToggleButton>
                <ToggleButton value={28}>6</ToggleButton>
            </ToggleButtonGroup>
        </Stack>
    )
}