import './App.css';
import * as React from "react";

import {Container, CssBaseline, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import {PlayerCountButtons} from "./components/PlayerCountButtons";
import {ChooseFactionButtons} from "./components/ChooseFactionButtons";

const ReachIndicator = ({ reach, requiredReach }) => (
    <h3 className="reach" data-cy="reach-indicator">{reach}/{requiredReach}+</h3>
)

const idToValuesMap = {
    'player2': { requiredReach: 17, playerCount: 2 },
    'player3': { requiredReach: 18, playerCount: 3 },
    'player4': { requiredReach: 21, playerCount: 4 },
    'player5': { requiredReach: 25, playerCount: 5 },
    'player6': { requiredReach: 28, playerCount: 6 },

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

    const handleToggleButtonChange = (event, newValue) => {
        if (newValue !== null) {
            const values = idToValuesMap[newValue];
            if (values) {
                setSelectedValue(newValue);
                setRequiredReach(values.requiredReach);
                setPlayerCount(values.playerCount);
            }
        }
    }

    return (
        <Container maxWidth="sm" className="App" sx={{ minWidth: "320px", height: "100%" }}>
            <CssBaseline/>
            <Stack
                container
                sx={{height: "100%"}}
                justifyContent="flex-start"
                alignItems="center"
            >
                <div className="reach-banner">
                    <ToggleButtonGroup
                        exclusive
                        value={isBanMode ? 'ban' : 'pick'}
                        onChange={(_, v) => { if (v !== null) setIsBanMode(v === 'ban'); }}
                    >
                        <ToggleButton value='ban'>Disable Factions</ToggleButton>
                        <ToggleButton value='pick'>Enable Factions</ToggleButton>
                    </ToggleButtonGroup>
                    <ReachIndicator reach={reach} requiredReach={requiredReach} />
                </div>
                <ChooseFactionButtons
                    playerCount={playerCount}
                    setReach={setReach}
                    reach={reach}
                    requiredReach={requiredReach}
                    isBanMode={isBanMode}
                />
                <PlayerCountButtons
                    selectedValue={selectedValue}
                    handleToggleButtonChange={handleToggleButtonChange}
                />
            </Stack>
        </Container>
    );
}

export default App;
