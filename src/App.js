import './App.css';


import marquiseImage from './faction-images/marquise.png'
import corvidImage from './faction-images/corvid.png'
import allianceImage from './faction-images/alliance.png'
import cultImage from './faction-images/cult.png'
import duchyImage from './faction-images/duchy.png'
import riverfolkImage from './faction-images/riverfolk.png'
import vagabondImage from './faction-images/vagabond.png'
import eyrieImage from './faction-images/eyrie.png'

import {Avatar, Box, Button, ButtonGroup, Fab, Stack} from "@mui/material";

const EYRIE = {name: "eyrie", image: eyrieImage};
const CORVID = {name: "corvid", image: corvidImage};
const ALLIANCE = {name: "alliance", image: allianceImage};
const CULT = {name: "cult", image: cultImage};
const DUCHY = {name: "duchy", image: duchyImage};
const RIVERFOLK = {name: "riverfolk", image: riverfolkImage};
const MARQUISE = {name: "marquise", image: marquiseImage};
const VAGABOND = {name: "vagabond", image: vagabondImage};


let choosableFactions = [EYRIE, CORVID, ALLIANCE, CULT, DUCHY, RIVERFOLK, MARQUISE, VAGABOND];


const ChooseFactionButtons = () => {
    return (
        <>
            <Stack direction="row"
                   justifyContent="center">
                {choosableFactions.map(choosableFaction => (
                    <Stack>
                        <Fab>
                            <Avatar
                                imgProps={{sx: {objectFit: "contain"}}}
                                src={choosableFaction.image}
                            />
                        </Fab>
                    </Stack>
                ))}
            </Stack>
        </>
    );
};


function App() {
    return (
        <div className="App">
            <Stack spacing={2}>
                <Box>
                    <ButtonGroup>
                        <Button>3</Button>
                        <Button>4</Button>
                        <Button>5</Button>
                        <Button>6</Button>
                    </ButtonGroup>
                </Box>
                <ChooseFactionButtons/>
            </Stack>
        </div>
    );
}

export default App;
