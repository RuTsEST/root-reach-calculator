import {Avatar, Badge, Fab, Grid} from "@mui/material";
import eyrieImage from "../faction-images/eyrie.png";
import corvidImage from "../faction-images/corvid.png";
import allianceImage from "../faction-images/alliance.png";
import cultImage from "../faction-images/cult.png";
import duchyImage from "../faction-images/duchy.png";
import riverfolkImage from "../faction-images/riverfolk.png";
import marquiseImage from "../faction-images/marquise.png";
import vagabondImage from "../faction-images/vagabond.png";

const factions = {
    marquise: {image: marquiseImage, reach: 10},
    eyrie: {image: eyrieImage, reach: 7},
    alliance: {image: allianceImage, reach: 3},
    vagabond1: {image: vagabondImage, reach: 5},
    riverfolk: {image: riverfolkImage, reach: 5},
    cult: {image: cultImage, reach: 2},
    corvid: {image: corvidImage, reach: 3},
    duchy: {image: duchyImage, reach: 8},
    vagabond2: {image: vagabondImage, reach: 2},
};

export const ChooseFactionButtons = () => {
    return (
        <Grid container columns={{xs: 3}} rowSpacing={6}>
            {Object.values(factions).map(faction => (
                <Grid item xs={1}>
                    <Fab sx={{width: "7em", height: "7em"}}>
                        <Badge
                            badgeContent={
                                <Avatar>{faction.reach}</Avatar>
                            }
                        >
                            <Avatar
                                sx={{width: "4em", height: "4em"}}
                                imgProps={{sx: {objectFit: "contain"}}}
                                src={faction.image}
                            />
                        </Badge>
                    </Fab>
                </Grid>
            ))}
        </Grid>
    );
};