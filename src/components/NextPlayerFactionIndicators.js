import {Avatar, Fab} from "@mui/material";

export const NextPlayerFactionIndicators = ({nextPlayerChoosableFactions}) => {
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