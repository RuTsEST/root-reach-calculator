import './App.css';
import * as React from "react";
import { Box, CssBaseline, IconButton, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import { PlayerCountButtons } from "./components/PlayerCountButtons";
import { ChooseFactionButtons } from "./components/ChooseFactionButtons";
import { ThemeToggleButton } from "./components/ThemeToggleButton";
import { DEFAULT_SELECTION, REACH_THRESHOLDS } from "./data/reachThresholds";
import { loadSession, saveSession } from "./sessionStorage";
import {
    getSystemPrefersDark,
    loadThemeOverride,
    resolveMode,
    saveThemeOverride,
    themeForMode,
} from "./theme";

const ReachIndicator = ({ reach, requiredReach }) => {
    const isMet = reach >= requiredReach;
    const statusCue = isMet ? 'OK' : 'Below target';
    return (
        <h3
            className="reach"
            data-cy="reach-indicator"
            aria-live="polite"
            style={{ color: isMet ? '#4da251' : '#b66969' }}
        >
            <span className="reach-values">Reach: {reach} / {requiredReach}+</span>
            <span className="reach-status">{statusCue}</span>
        </h3>
    );
};

function selectionFromSession(session) {
    const key = REACH_THRESHOLDS[session.selectedValue]
        ? session.selectedValue
        : DEFAULT_SELECTION;
    const values = REACH_THRESHOLDS[key];
    return {
        selectedValue: key,
        requiredReach: values.requiredReach,
        playerCount: values.playerCount,
        isBanMode: session.isBanMode,
    };
}

function App() {
    const initial = React.useMemo(() => selectionFromSession(loadSession()), []);

    const [reach, setReach] = React.useState(0);
    const [requiredReach, setRequiredReach] = React.useState(initial.requiredReach);
    const [playerCount, setPlayerCount] = React.useState(initial.playerCount);
    const [selectedValue, setSelectedValue] = React.useState(initial.selectedValue);
    const [isBanMode, setIsBanMode] = React.useState(initial.isBanMode);
    const [resetKey, setResetKey] = React.useState(0);

    const [themeOverride, setThemeOverride] = React.useState(() => loadThemeOverride());
    const [systemPrefersDark, setSystemPrefersDark] = React.useState(() => getSystemPrefersDark());
    const mode = resolveMode(themeOverride, systemPrefersDark);
    const theme = themeForMode(mode);

    React.useEffect(() => {
        if (themeOverride !== null) return undefined;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (event) => setSystemPrefersDark(event.matches);
        if (typeof mq.addEventListener === 'function') {
            mq.addEventListener('change', onChange);
            return () => mq.removeEventListener('change', onChange);
        }
        mq.addListener(onChange);
        return () => mq.removeListener(onChange);
    }, [themeOverride]);

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
        document.documentElement.style.colorScheme = mode;
    }, [mode]);

    const handleThemeToggle = React.useCallback(() => {
        const next = mode === 'dark' ? 'light' : 'dark';
        setThemeOverride(next);
        saveThemeOverride(next);
    }, [mode]);

    const handleToggleButtonChange = React.useCallback((event, newValue) => {
        if (newValue !== null) {
            const values = REACH_THRESHOLDS[newValue];
            if (values) {
                setSelectedValue(newValue);
                setRequiredReach(values.requiredReach);
                setPlayerCount(values.playerCount);
                saveSession({ selectedValue: newValue });
            }
        }
    }, []);

    const handleBanModeChange = React.useCallback((_, v) => {
        if (v === null) return;
        const next = v === 'ban';
        setIsBanMode(next);
        saveSession({ isBanMode: next });
    }, []);

    const handleReset = () => {
        // Clear picks/bans from session; keep mode and player/bot selection.
        saveSession({ factionStatuses: {} });
        setResetKey(k => k + 1);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                data-theme={mode}
                sx={{
                    height: '100dvh',
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: 'sm',
                    margin: '0 auto',
                    minWidth: '320px',
                    bgcolor: 'background.default',
                    color: 'text.primary',
                }}
            >
                <Box className="app-header">
                    <ToggleButtonGroup
                        exclusive
                        value={isBanMode ? 'ban' : 'pick'}
                        onChange={handleBanModeChange}
                    >
                        <ToggleButton value='ban'>Ban</ToggleButton>
                        <ToggleButton value='pick'>Pick</ToggleButton>
                    </ToggleButtonGroup>
                    <ReachIndicator reach={reach} requiredReach={requiredReach} />
                    <Box className="app-header-actions">
                        <ThemeToggleButton mode={mode} onToggle={handleThemeToggle} />
                        <IconButton onClick={handleReset} size="small" aria-label="reset">
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                </Box>
                <Box className="app-main">
                    <Box className="faction-grid-wrap">
                        <ChooseFactionButtons
                            key={resetKey}
                            playerCount={playerCount}
                            setReach={setReach}
                            requiredReach={requiredReach}
                            isBanMode={isBanMode}
                        />
                    </Box>
                </Box>
                <Box className="app-footer">
                    <PlayerCountButtons
                        selectedValue={selectedValue}
                        handleToggleButtonChange={handleToggleButtonChange}
                    />
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App;
