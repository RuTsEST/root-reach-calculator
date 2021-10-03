import './App.css';

import {Container, CssBaseline, Stack} from "@mui/material";
import {PlayerCountButtons} from "./components/PlayerCountButtons";
import {ChooseFactionButtons} from "./components/ChooseFactionButtons";


function App() {
    return (
        <Container maxWidth="sm" className="App" style={{height: "100%"}}>
            <CssBaseline/>
            <Stack
                container
                sx={{height: "100%"}}
                justifyContent="space-around"
                alignItems="center"
            >
                <h3>5/21</h3>
                <ChooseFactionButtons/>
                <PlayerCountButtons/>
            </Stack>
        </Container>
    );
}

export default App;
