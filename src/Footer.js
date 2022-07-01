import {Grid} from "@mui/material";
import "./Footer.css"

export default function Footer() {
    return <div className={"footer"}>
        <Grid container spacing={1}>
            <Grid item xs={3} />
            <Grid item xs={2}>
                <a href={"https://twitter.com/MemeDegens/"} target="_blank"><img width="32" height="32"
                                                                         src={'/twitter.png'}/>Twitter</a>
            </Grid>
            <Grid item xs={2}>
                <a href={"https://discord.gg/uZvWu4gH"} target="_blank"><img width="32" height="32"
                                                                         src={'/discord.png'}/>Discord</a>
            </Grid>
            <Grid item xs={2}>
                <a href={"https://medium.com/@memedegens/"} target="_blank"><img width="32" height="32"
                                                                         src={'/medium.png'}/>Medium</a>
            </Grid>
        </Grid>
    </div>
}