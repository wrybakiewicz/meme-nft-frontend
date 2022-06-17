import {Grid} from "@mui/material";
import "./CompetitionDetails.css"

export default function CompetitionDetails({competition, showCompetition}) {
    const formatMoment = (moment) => {
        return moment.format('MMMM Do YYYY, h:mm:ss a')
    }

    return <div>
        <Grid container spacing={1} className={"details"}>
            <Grid item xs={2}>
                {showCompetition ? competition.name : null}
            </Grid>
            <Grid item xs={3}>
                From: {formatMoment(competition.startDate)}
            </Grid>
            <Grid item xs={3}>
                To: {formatMoment(competition.endDate)}
            </Grid>
            <Grid item xs={3}>
                Winners: 5
            </Grid>
        </Grid>
    </div>
}