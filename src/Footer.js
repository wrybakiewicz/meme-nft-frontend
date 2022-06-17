import {Grid} from "@mui/material";
import "./Footer.css"

export default function Footer() {
    return <div className={"footer"}>
        <Grid container spacing={1}>
            <Grid item xs={3} />
            <Grid item xs={2}>
                <a href={"https://www.google.com/"} target="_blank"><img width="32" height="32"
                                                                         src={'/twitter.png'}/>Twitter</a>
            </Grid>
            <Grid item xs={2}>
                <a href={"https://www.google.com/"} target="_blank"><img width="32" height="32"
                                                                         src={'/discord.png'}/>Discord</a>
            </Grid>
            <Grid item xs={2}>
                <a href={"https://www.google.com/"} target="_blank"><img width="32" height="32"
                                                                         src={'/medium.png'}/>Medium</a>
            </Grid>
        </Grid>
    </div>
}