import './App.css';
import * as React from "react";
import { Box, CssBaseline, IconButton, ToggleButton, ToggleButtonGroup } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { PlayerCountButtons } from "./components/PlayerCountButtons";
import { ChooseFactionButtons } from "./components/ChooseFactionButtons";

const ReachIndicator = ({ reach, requiredReach }) => {
    const isMet = reach >= requiredReach;
    return (
        <h3
            className="reach"
            data-cy="reach-indicator"
            style={{ color: isMet ? '#4da251' : '#b66969', margin: 0 }}
        >
            Reach: {reach} / {requiredReach}+
        </h3>
    );
};

const idToValuesMap = {
    'player2': { requiredReach: 17, playerCount: 2 },
    'player3': { requiredReach: 18, playerCount: 3 },
    'player4': { requiredReach: 21, playerCount: 4 },
    'player5': { requiredReach: 25, playerCount: 5 },
    'player6': { requiredReach: 28, playerCount: 6 },

    // Clockwork reach thresholds are unofficial estimates based on feel,
    // not sourced from official Root rules or the Clockwork expansion rulebook.
    '1clockwork1': { requiredReach: 8, playerCount: 1 },
    '1clockwork2': { requiredReach: 12, playerCount: 2 },
    '1clockwork3': { requiredReach: 14, playerCount: 3 },
    '1clockwork4': { requiredReach: 16, playerCount: 4 },

    '2clockwork1': { requiredReach: 9, playerCount: 1 },
    '2clockwork2': { requiredReach: 14, playerCount: 2 },
    '2clockwork3': { requiredReach: 18, playerCount: 3 },
    '2clockwork4': { requiredReach: 21, playerCount: 4 },
};

function App() {
    const [reach, setReach] = React.useState(0);
    const [requiredReach, setRequiredReach] = React.useState(21);
    const [playerCount, setPlayerCount] = React.useState(4);
    const [selectedValue, setSelectedValue] = React.useState('player4');
    const [isBanMode, setIsBanMode] = React.useState(false);
    const [resetKey, setResetKey] = React.useState(0);

    const handleToggleButtonChange = React.useCallback((event, newValue) => {
        if (newValue !== null) {
            const values = idToValuesMap[newValue];
            if (values) {
                setSelectedValue(newValue);
                setRequiredReach(values.requiredReach);
                setPlayerCount(values.playerCount);
            }
        }
    }, []);

    const handleReset = () => {
        setResetKey(k => k + 1);
    };

    return (
        <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 'sm', margin: '0 auto', minWidth: '320px' }}>
            <CssBaseline />
            <Box className="app-header">
                <ToggleButtonGroup
                    exclusive
                    value={isBanMode ? 'ban' : 'pick'}
                    onChange={(_, v) => { if (v !== null) setIsBanMode(v === 'ban'); }}
                >
                    <ToggleButton value='ban'>Ban</ToggleButton>
                    <ToggleButton value='pick'>Pick</ToggleButton>
                </ToggleButtonGroup>
                <ReachIndicator reach={reach} requiredReach={requiredReach} />
                <IconButton onClick={handleReset} size="small" aria-label="reset">
                    <RefreshIcon />
                </IconButton>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                <ChooseFactionButtons
                    key={resetKey}
                    playerCount={playerCount}
                    setReach={setReach}
                    reach={reach}
                    requiredReach={requiredReach}
                    isBanMode={isBanMode}
                />
            </Box>
            <Box className="app-footer">
                <PlayerCountButtons
                    selectedValue={selectedValue}
                    handleToggleButtonChange={handleToggleButtonChange}
                />
            </Box>
        </Box>
    );
}

export default App;
