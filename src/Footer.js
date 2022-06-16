import {Grid} from "@mui/material";

export default function Footer() {
    return <Grid container spacing={2}>
        <Grid item xs={5} />
        <Grid item xs={2}>
            <a href={"https://www.google.com/"} target="_blank"><img width="75" height="75" src={'/twitter.png'}/></a>
        </Grid>
        <Grid item xs={2}>
            <a href={"https://www.google.com/"} target="_blank"><img width="75" height="75" src={'/discord.png'}/></a>
        </Grid>
    </Grid>
}