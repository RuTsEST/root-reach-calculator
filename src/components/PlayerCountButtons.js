import * as React from 'react';
import { Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6];
const BOT_OPTIONS = [0, 1, 2];

const parseSelection = (value) => {
    if (value.startsWith('1clockwork')) {
        return { bots: 1, players: Number(value.slice('1clockwork'.length)) };
    }
    if (value.startsWith('2clockwork')) {
        return { bots: 2, players: Number(value.slice('2clockwork'.length)) };
    }
    return { bots: 0, players: Number(value.slice('player'.length)) };
};

const toReachKey = (bots, players) => {
    if (bots === 1) return `1clockwork${players}`;
    if (bots === 2) return `2clockwork${players}`;
    return `player${players}`;
};

const isPlayerCountLegal = (bots, players) => {
    if (bots === 0) return players >= 2 && players <= 6;
    return players >= 1 && players <= 4;
};

const resolvePlayersForBots = (bots, currentPlayers) => {
    if (isPlayerCountLegal(bots, currentPlayers)) return currentPlayers;
    if (bots === 0) return Math.max(2, Math.min(6, currentPlayers));
    return Math.max(1, Math.min(4, currentPlayers));
};

const labelSx = {
    color: 'text.secondary',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
    lineHeight: 1,
    textTransform: 'uppercase',
    userSelect: 'none',
    flexShrink: 0,
};

const groupSx = {
    '& .MuiToggleButton-root': {
        px: 0.75,
        py: 0.25,
        minWidth: '1.75rem',
        fontSize: '0.8rem',
        lineHeight: 1.4,
    },
};

export const PlayerCountButtons = ({ selectedValue, handleToggleButtonChange }) => {
    const { bots, players } = parseSelection(selectedValue);

    const emit = (nextBots, nextPlayers) => {
        handleToggleButtonChange(null, toReachKey(nextBots, nextPlayers));
    };

    const handleBotsChange = (_, newBots) => {
        if (newBots === null || newBots === bots) return;
        emit(newBots, resolvePlayersForBots(newBots, players));
    };

    const handlePlayersChange = (_, newPlayers) => {
        if (newPlayers === null || newPlayers === players) return;
        if (!isPlayerCountLegal(bots, newPlayers)) return;
        emit(bots, newPlayers);
    };

    return (
        <Stack
            direction="row"
            spacing={1.25}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
            justifyContent="center"
            sx={{ px: 0.75, py: 0.4 }}
        >
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography component="span" sx={labelSx} aria-hidden="true">
                    Players
                </Typography>
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={players}
                    onChange={handlePlayersChange}
                    aria-label="Players"
                    sx={groupSx}
                >
                    {PLAYER_OPTIONS.map((count) => (
                        <ToggleButton
                            key={count}
                            value={count}
                            disabled={!isPlayerCountLegal(bots, count)}
                            aria-label={`${count} player${count === 1 ? '' : 's'}`}
                        >
                            {count}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography component="span" sx={labelSx} aria-hidden="true">
                    Bots
                </Typography>
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={bots}
                    onChange={handleBotsChange}
                    aria-label="Bots"
                    sx={groupSx}
                >
                    {BOT_OPTIONS.map((count) => (
                        <ToggleButton
                            key={count}
                            value={count}
                            aria-label={`${count} bot${count === 1 ? '' : 's'}`}
                        >
                            {count}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>
        </Stack>
    );
};
