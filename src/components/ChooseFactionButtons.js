import {Avatar, Divider, Fab, Stack} from "@mui/material";
import {NextPlayerFactionIndicators} from "./NextPlayerFactionIndicators";
import eyrieImage from "../faction-images/eyrie.png";
import corvidImage from "../faction-images/corvid.png";
import allianceImage from "../faction-images/alliance.png";
import cultImage from "../faction-images/cult.png";
import duchyImage from "../faction-images/duchy.png";
import riverfolkImage from "../faction-images/riverfolk.png";
import marquiseImage from "../faction-images/marquise.png";
import vagabondImage from "../faction-images/vagabond.png";

const EYRIE = {name: "eyrie", image: eyrieImage, nextPlayerChoosableFactions: []};
const CORVID = {name: "corvid", image: corvidImage, nextPlayerChoosableFactions: [EYRIE]};
const ALLIANCE = {name: "alliance", image: allianceImage, nextPlayerChoosableFactions: [CORVID, EYRIE]};
const CULT = {name: "cult", image: cultImage, nextPlayerChoosableFactions: [CORVID, ALLIANCE]};
// eslint-disable-next-line no-unused-vars
const DUCHY = {name: "duchy", image: duchyImage, nextPlayerChoosableFactions: [CORVID, ALLIANCE, CULT]};
// eslint-disable-next-line no-unused-vars
const RIVERFOLK = {name: "riverfolk", image: riverfolkImage, nextPlayerChoosableFactions: [CORVID, ALLIANCE, CULT]};
// eslint-disable-next-line no-unused-vars
const MARQUISE = {name: "marquise", image: marquiseImage, nextPlayerChoosableFactions: [CORVID, ALLIANCE, CULT]};
// eslint-disable-next-line no-unused-vars
const VAGABOND = {name: "vagabond", image: vagabondImage, nextPlayerChoosableFactions: [CORVID, ALLIANCE, CULT]};

let choosableFactions = [EYRIE, CORVID, ALLIANCE, CULT];

export const ChooseFactionButtons = () => {
    return (
        <>
            <Stack direction="row"
                   justifyContent="center">
                {choosableFactions.map(faction => (
                    <Stack justifyContent="start" alignItems="center" spacing={1}>
                        <Fab>
                            <Avatar
                                imgProps={{sx: {objectFit: "contain"}}}
                                src={faction.image}
                            />
                        </Fab>
                        <Divider flexItem />
                        <NextPlayerFactionIndicators
                            nextPlayerChoosableFactions={faction.nextPlayerChoosableFactions}/>
                    </Stack>
                ))}
            </Stack>
        </>
    );
};