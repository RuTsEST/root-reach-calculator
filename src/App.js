import './App.css';


import marquiseImage from './faction-images/marquise.png'
import corvidImage from './faction-images/corvid.png'
import allianceImage from './faction-images/alliance.png'
import cultImage from './faction-images/cult.png'
import duchyImage from './faction-images/duchy.png'
import riverfolkImage from './faction-images/riverfolk.png'
import vagabondImage from './faction-images/vagabond.png'
import eyrieImage from './faction-images/eyrie.png'

import {Avatar, Box, Button, ButtonGroup, Container, Fab, Stack} from "@mui/material";

const EYRIE = {name: "eyrie", image: eyrieImage, nextPlayerChoosableFactions: []};
const CORVID = {name: "corvid", image: corvidImage, nextPlayerChoosableFactions: [EYRIE]};
const ALLIANCE = {name: "alliance", image: allianceImage, nextPlayerChoosableFactions: [CORVID, EYRIE]};
const CULT = {name: "cult", image: cultImage, nextPlayerChoosableFactions: [CORVID, ALLIANCE]};
const DUCHY = {name: "duchy", image: duchyImage, nextPlayerChoosableFactions: [CORVID, ALLIANCE, CULT]};
const RIVERFOLK = {name: "riverfolk", image: riverfolkImage, nextPlayerChoosableFactions: [CORVID, ALLIANCE, CULT]};
const MARQUISE = {name: "marquise", image: marquiseImage, nextPlayerChoosableFactions: [CORVID, ALLIANCE, CULT]};
const VAGABOND = {name: "vagabond", image: vagabondImage, nextPlayerChoosableFactions: [CORVID, ALLIANCE, CULT]};

let choosableFactions = [EYRIE, CORVID, ALLIANCE, CULT];

const NextPlayerFactionIndicators = ({nextPlayerChoosableFactions}) => {
    return (
        <>
            {nextPlayerChoosableFactions.map(faction => (
                <Fab size="small">
                    <Avatar
                        sx={{
                            "& .MuiAvatar-img": {
                                width: "60%"
                            }
                        }}
                        imgProps={{
                            sx: {
                                objectFit: "contain",
                            }
                        }}
                        src={faction.image}
                    />
                </Fab>
            ))}
        </>
    );
};

const ChooseFactionButtons = () => {
    return (
        <>
            <Stack direction="row"
                   justifyContent="center">
                {choosableFactions.map(faction => (
                    <Stack>
                        <Fab>
                            <Avatar
                                // sx={{width: "80%"}}
                                imgProps={{sx: {objectFit: "contain"}}}
                                src={faction.image}
                            />
                        </Fab>
                        <NextPlayerFactionIndicators
                            nextPlayerChoosableFactions={faction.nextPlayerChoosableFactions}/>
                    </Stack>
                ))}
            </Stack>
        </>
    );
};

const PlayerCountButtons = () => {
    return (
        <Box>
            <ButtonGroup>
                <Button>3</Button>
                <Button>4</Button>
                <Button>5</Button>
                <Button>6</Button>
            </ButtonGroup>
        </Box>
    )
};

function App() {
    return (
        <div className="App">
            <Container>
                <Stack spacing={2} justifyContent="center">
                    <PlayerCountButtons/>
                    <ChooseFactionButtons/>
                </Stack>
            </Container>
        </div>
    );
}

export default App;
