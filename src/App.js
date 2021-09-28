import './App.css';

import {Container, Stack} from "@mui/material";
import {PlayerCountButtons} from "./components/PlayerCountButtons";
import {ChooseFactionButtons} from "./components/ChooseFactionButtons";


function App() {
    return (
        <div className="App">
            <Container sx={{marginTop: 2}}>
                <Stack spacing={2} justifyContent="center">
                    <PlayerCountButtons/>
                    <ChooseFactionButtons/>
                </Stack>
            </Container>
        </div>
    );
}

export default App;
