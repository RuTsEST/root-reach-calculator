import './App.css';
import * as React from "react";

import {Container, CssBaseline, Stack} from "@mui/material";
import {PlayerCountButtons} from "./components/PlayerCountButtons";
import {ChooseFactionButtons} from "./components/ChooseFactionButtons";


const ReachIndicator = ({reach, requiredReach}) => {
    return(
        <h3 data-cy={`reach-indicator`}>{reach}/{requiredReach}+</h3>
    )
}

function App() {
    const [reach, setReach] = React.useState(0);
    const [requiredReach, setRequiredReach] = React.useState(21);
    const [playerCount, setPlayerCount] = React.useState(4);

    const handlePlayerCountButtonPress = (event, newRequiredReach) => {
        if (newRequiredReach != null) {
            setRequiredReach(newRequiredReach)
            setPlayerCount(event.target.innerText)
        }
    }

    return (
        <Container maxWidth="sm" className="App" style={{height: "100%"}}>
            <CssBaseline/>
            <Stack
                container
                sx={{height: "100%"}}
                justifyContent="space-around"
                alignItems="center"
            >
                <ReachIndicator reach={reach} requiredReach={requiredReach}/>
                <ChooseFactionButtons
                    playerCount={playerCount}
                    setReach={setReach}
                    reach={reach}
                    requiredReach={requiredReach}
                />
                <PlayerCountButtons
                    requiredReach={requiredReach}
                    handlePlayerCountButtonPress={handlePlayerCountButtonPress}
                />
            </Stack>
        </Container>
    );
}

export default App;
