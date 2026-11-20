import * as React from 'react';
import { Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { playerCountFromKey, playerCountKeyFromCount } from '../data/reachThresholds';

const PLAYER_OPTIONS = ['2', '3', '4', '5', '6'];

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
        py: { xs: 0.7, sm: 0.8 },
        minWidth: { xs: '1.65rem', sm: '2.25rem' },
        minHeight: { xs: '2.15rem', sm: '2.35rem' },
        fontSize: { xs: '0.8rem', sm: '0.875rem' },
        lineHeight: 1.35,
    },
};

export const PlayerCountButtons = ({ playerCountKey, onPlayerCountChange }) => {
    const players = playerCountFromKey(playerCountKey);

    const handlePlayersChange = (_, newPlayers) => {
        if (newPlayers === null) return;
        const nextPlayers = Number(newPlayers);
        if (nextPlayers === players) return;
        if (nextPlayers < 2 || nextPlayers > 6) return;
        onPlayerCountChange(playerCountKeyFromCount(nextPlayers));
    };

    return (
        <Stack
            className="player-count-bar"
            direction="row"
            flexWrap="nowrap"
            alignItems="center"
            justifyContent="center"
            sx={{
                px: { xs: 0.4, sm: 0.75 },
                py: { xs: 0.55, sm: 0.65 },
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
                                aria-label={`${n} player${n === 1 ? '' : 's'}`}
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
