import './App.css';
import * as React from "react";
import {
    Box,
    Button,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import CasinoIcon from "@mui/icons-material/Casino";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { PlayerCountButtons } from "./components/PlayerCountButtons";
import { ChooseFactionButtons } from "./components/ChooseFactionButtons";
import { ThemeToggleButton } from "./components/ThemeToggleButton";
import { DEFAULT_SELECTION, REACH_THRESHOLDS } from "./data/reachThresholds";
import { loadSession, saveSession } from "./sessionStorage";
import { FEEDBACK_URL, REACH_LAW_URL } from "./constants";
import {
    getSystemPrefersDark,
    loadThemePreference,
    resolveMode,
    saveThemePreference,
    nextThemePreference,
    themeForMode,
} from "./theme";

const ReachIndicator = ({ reach, requiredReach }) => {
    const [helpOpen, setHelpOpen] = React.useState(false);
    const isMet = reach >= requiredReach;
    const statusCue = isMet ? 'OK' : 'Below target';
    return (
        <>
            <h3
                className="reach"
                data-cy="reach-indicator"
                aria-live="polite"
            >
                <span className="reach-values-row">
                    <span
                        className="reach-values"
                        style={{ color: isMet ? '#4da251' : '#b66969' }}
                    >
                        Reach: {reach} / {requiredReach}+
                    </span>
                    <IconButton
                        className="reach-help"
                        size="small"
                        aria-label="What is Reach?"
                        title="What is Reach?"
                        data-cy="reach-help"
                        onClick={() => setHelpOpen(true)}
                    >
                        <HelpOutlineIcon fontSize="inherit" />
                    </IconButton>
                </span>
                <span
                    className="reach-status"
                    style={{ color: isMet ? '#4da251' : '#b66969' }}
                >
                    {statusCue}
                </span>
            </h3>
            <Dialog
                open={helpOpen}
                onClose={() => setHelpOpen(false)}
                aria-labelledby="reach-help-title"
                fullWidth
                maxWidth="xs"
                scroll="paper"
            >
                <DialogTitle id="reach-help-title">Reach</DialogTitle>
                <DialogContent dividers className="reach-help-dialog-body">
                    <Typography variant="subtitle2" component="h4" gutterBottom>
                        What is Reach?
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Reach is a rough score for how strong a faction feels at the table —
                        higher Reach means more presence in the setup. Add up the factions you
                        pick; your player count needs a minimum total.
                    </Typography>
                    <Typography variant="subtitle2" component="h4" gutterBottom>
                        Why it matters
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Miss the target and the game is usually too soft or awkward for that
                        player count.
                    </Typography>
                    <Typography variant="body2">
                        <Link
                            href={REACH_LAW_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cy="reach-law-link"
                        >
                            Reach targets in Law of Root
                        </Link>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHelpOpen(false)} autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
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
    const [fillRequestId, setFillRequestId] = React.useState(0);
    const [fillState, setFillState] = React.useState({ disabled: false, reason: '' });

    const [themePreference, setThemePreference] = React.useState(() => loadThemePreference());
    const [systemPrefersDark, setSystemPrefersDark] = React.useState(() => getSystemPrefersDark());
    const mode = resolveMode(themePreference, systemPrefersDark);
    const theme = themeForMode(mode);

    React.useEffect(() => {
        // Always watch OS changes so "system" stays live; harmless when overridden.
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (event) => setSystemPrefersDark(event.matches);
        if (typeof mq.addEventListener === 'function') {
            mq.addEventListener('change', onChange);
            return () => mq.removeEventListener('change', onChange);
        }
        mq.addListener(onChange);
        return () => mq.removeListener(onChange);
    }, []);

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
        document.documentElement.setAttribute('data-theme-preference', themePreference);
        document.documentElement.style.colorScheme = mode;
    }, [mode, themePreference]);

    const handleThemeToggle = React.useCallback(() => {
        const next = nextThemePreference(themePreference);
        setThemePreference(next);
        saveThemePreference(next);
    }, [themePreference]);

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
        // Clear picks/bans from session; keep mode and player selection.
        // Also clear fillRequestId so remounting the grid does not re-run the
        // last random-fill request (refs reset on remount).
        saveSession({ factionStatuses: {} });
        setFillRequestId(0);
        setResetKey(k => k + 1);
        setFillState({ disabled: false, reason: '' });
    };

    const handleRandomFill = () => {
        if (fillState.disabled) return;
        setFillRequestId((id) => id + 1);
    };

    const fillTitle = fillState.disabled
        ? (fillState.reason || 'No valid faction spread for this table')
        : 'Fill random factions';

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
                        aria-label="Selection mode"
                    >
                        <ToggleButton value='pick'>Pick</ToggleButton>
                        <ToggleButton value='ban'>Ban</ToggleButton>
                    </ToggleButtonGroup>
                    <ReachIndicator reach={reach} requiredReach={requiredReach} />
                    <Box className="app-header-actions">
                        <IconButton
                            onClick={handleRandomFill}
                            size="small"
                            aria-label="Fill random factions"
                            title={fillTitle}
                            disabled={fillState.disabled}
                            data-cy="random-fill"
                        >
                            <CasinoIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={handleReset} size="small" aria-label="reset">
                            <RefreshIcon fontSize="small" />
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
                            fillRequestId={fillRequestId}
                            onFillStateChange={setFillState}
                        />
                    </Box>
                </Box>
                <Box className="app-footer">
                    <PlayerCountButtons
                        selectedValue={selectedValue}
                        handleToggleButtonChange={handleToggleButtonChange}
                    />
                    <Box className="app-footer-config" aria-label="Settings">
                        <ThemeToggleButton preference={themePreference} onToggle={handleThemeToggle} />
                        <IconButton
                            className="feedback-link"
                            component="a"
                            href={FEEDBACK_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            aria-label="Leave feedback on GitHub"
                            title="Leave feedback on GitHub"
                            data-cy="feedback-link"
                            color="default"
                        >
                            <FeedbackOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App;
