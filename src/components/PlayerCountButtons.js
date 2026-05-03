import * as React from 'react';
import {Divider, Stack, ToggleButton, ToggleButtonGroup} from "@mui/material";

export const PlayerCountButtons = ({selectedValue, handleToggleButtonChange}) => {
    return (
        <Stack justifyContent="center">
            <div className="container">
                <h4>Players</h4>
                <ToggleButtonGroup 
                    exclusive 
                    value={selectedValue} 
                    onChange={handleToggleButtonChange}
                    >
                    <ToggleButton value='player2'>2</ToggleButton>
                    <ToggleButton value='player3'>3</ToggleButton>
                    <ToggleButton value='player4'>4</ToggleButton>
                    <ToggleButton value='player5'>5</ToggleButton>
                    <ToggleButton value='player6'>6</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <Divider sx={{ my: 1 }}>vs Clockwork</Divider>
            <div className="container">
                <h4>1 Clockwork</h4>
                <ToggleButtonGroup 
                    exclusive 
                    value={selectedValue} 
                    onChange={handleToggleButtonChange}
                    >
                    <ToggleButton value='1clockwork1'>1</ToggleButton>
                    <ToggleButton value='1clockwork2'>2</ToggleButton>
                    <ToggleButton value='1clockwork3'>3</ToggleButton>
                    <ToggleButton value='1clockwork4'>4</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div className="container">
                <h4>2 Clockworks</h4>
                <ToggleButtonGroup 
                    exclusive 
                    value={selectedValue} 
                    onChange={handleToggleButtonChange}
                    >
                    <ToggleButton value='2clockwork1'>1</ToggleButton>
                    <ToggleButton value='2clockwork2'>2</ToggleButton>
                    <ToggleButton value='2clockwork3'>3</ToggleButton>
                    <ToggleButton value='2clockwork4'>4</ToggleButton>
                </ToggleButtonGroup>
            </div>
        </Stack>
    );
};
