import * as React from 'react';
import {Stack, ToggleButton, ToggleButtonGroup} from "@mui/material";

export const PlayerCountButtons = () => {
    const [playerCount, setPlayerCount] = React.useState(4)

    const handlePlayerCount = (event, newPlayerCount) => {
        setPlayerCount(newPlayerCount);
    }

    return (
        <Stack justifyContent="center">
            <h4>Players</h4>
            <ToggleButtonGroup exclusive value={playerCount} onChange={handlePlayerCount}>
                <ToggleButton value={3}>3</ToggleButton>
                <ToggleButton value={4}>4</ToggleButton>
                <ToggleButton value={5}>5</ToggleButton>
                <ToggleButton value={6}>6</ToggleButton>
            </ToggleButtonGroup>
        </Stack>
    )
}