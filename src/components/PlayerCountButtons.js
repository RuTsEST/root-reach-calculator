import * as React from 'react';
import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';

const modeButtons = {
    players: [
        { value: 'player2', label: '2' },
        { value: 'player3', label: '3' },
        { value: 'player4', label: '4' },
        { value: 'player5', label: '5' },
        { value: 'player6', label: '6' },
    ],
    '1bot': [
        { value: '1clockwork1', label: '1' },
        { value: '1clockwork2', label: '2' },
        { value: '1clockwork3', label: '3' },
        { value: '1clockwork4', label: '4' },
    ],
    '2bots': [
        { value: '2clockwork1', label: '1' },
        { value: '2clockwork2', label: '2' },
        { value: '2clockwork3', label: '3' },
        { value: '2clockwork4', label: '4' },
    ],
};

const modeDefaults = {
    players: 'player4',
    '1bot': '1clockwork1',
    '2bots': '2clockwork1',
};

const getMode = (value) => {
    if (value.startsWith('1clockwork')) return '1bot';
    if (value.startsWith('2clockwork')) return '2bots';
    return 'players';
};

export const PlayerCountButtons = ({ selectedValue, handleToggleButtonChange }) => {
    const currentMode = getMode(selectedValue);

    const handleModeChange = (_, newMode) => {
        if (newMode !== null && newMode !== currentMode) {
            handleToggleButtonChange(null, modeDefaults[newMode]);
        }
    };

    return (
        <Stack spacing={1} sx={{ padding: '0.5rem' }}>
            <ToggleButtonGroup
                exclusive
                value={currentMode}
                onChange={handleModeChange}
                fullWidth
            >
                <ToggleButton value='players'>Players</ToggleButton>
                <ToggleButton value='1bot'>1 Bot</ToggleButton>
                <ToggleButton value='2bots'>2 Bots</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
                exclusive
                value={selectedValue}
                onChange={handleToggleButtonChange}
                sx={{ justifyContent: 'center' }}
            >
                {modeButtons[currentMode].map(({ value, label }) => (
                    <ToggleButton key={value} value={value}>{label}</ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Stack>
    );
};
