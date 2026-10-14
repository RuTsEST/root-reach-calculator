import * as React from 'react';
import { Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

const PLAYER_OPTIONS = ['1', '2', '3', '4', '5', '6'];
const BOT_OPTIONS = ['0', '1', '2'];

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
    fontSize: { xs: '0.62rem', sm: '0.75rem' },
    fontWeight: 600,
    letterSpacing: '0.02em',
    lineHeight: 1,
    textTransform: 'uppercase',
    userSelect: 'none',
    flexShrink: 0,
};

const groupSx = {
    flexShrink: 0,
    '& .MuiToggleButton-root': {
        px: { xs: 0.55, sm: 1.1 },
        py: { xs: 0.45, sm: 0.55 },
        minWidth: { xs: '1.65rem', sm: '2.25rem' },
        fontSize: { xs: '0.8rem', sm: '0.875rem' },
        lineHeight: 1.35,
    },
};

export const PlayerCountButtons = ({ selectedValue, handleToggleButtonChange }) => {
    const { bots, players } = parseSelection(selectedValue);

    const emit = (nextBots, nextPlayers) => {
        handleToggleButtonChange(null, toReachKey(nextBots, nextPlayers));
    };

    const handleBotsChange = (_, newBots) => {
        if (newBots === null) return;
        const nextBots = Number(newBots);
        if (nextBots === bots) return;
        emit(nextBots, resolvePlayersForBots(nextBots, players));
    };

    const handlePlayersChange = (_, newPlayers) => {
        if (newPlayers === null) return;
        const nextPlayers = Number(newPlayers);
        if (nextPlayers === players) return;
        if (!isPlayerCountLegal(bots, nextPlayers)) return;
        emit(bots, nextPlayers);
    };

    return (
        <Stack
            direction="row"
            flexWrap="nowrap"
            alignItems="center"
            justifyContent="center"
            sx={{
                px: { xs: 0.4, sm: 0.75 },
                py: { xs: 0.45, sm: 0.55 },
                gap: { xs: 0.65, sm: 1.5 },
                overflowX: 'auto',
            }}
        >
            <Stack direction="row" alignItems="center" sx={{ gap: { xs: 0.35, sm: 0.75 }, flexShrink: 0 }}>
                <Typography component="span" sx={labelSx} aria-hidden="true">
                    Players
                </Typography>
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={String(players)}
                    onChange={handlePlayersChange}
                    aria-label="Players"
                    sx={groupSx}
                >
                    {PLAYER_OPTIONS.map((count) => {
                        const n = Number(count);
                        return (
                            <ToggleButton
                                key={count}
                                value={count}
                                disabled={!isPlayerCountLegal(bots, n)}
                                aria-label={`${n} player${n === 1 ? '' : 's'}`}
                            >
                                {count}
                            </ToggleButton>
                        );
                    })}
                </ToggleButtonGroup>
            </Stack>
            <Stack direction="row" alignItems="center" sx={{ gap: { xs: 0.35, sm: 0.75 }, flexShrink: 0 }}>
                <Typography component="span" sx={labelSx} aria-hidden="true">
                    Bots
                </Typography>
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={String(bots)}
                    onChange={handleBotsChange}
                    aria-label="Bots"
                    sx={groupSx}
                >
                    {BOT_OPTIONS.map((count) => {
                        const n = Number(count);
                        return (
                            <ToggleButton
                                key={count}
                                value={count}
                                aria-label={`${n} bot${n === 1 ? '' : 's'}`}
                            >
                                {count}
                            </ToggleButton>
                        );
                    })}
                </ToggleButtonGroup>
            </Stack>
        </Stack>
    );
};
