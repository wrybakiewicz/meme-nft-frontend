import {Grid} from "@mui/material";

export default function CompetitionDetails({competition, showCompetition}) {
    const formatMoment = (moment) => {
        return moment.format('MMMM Do YYYY, h:mm:ss a')
    }

    return <Grid container spacing={3}>
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

//     <div>
//         <div>{competition.name}</div>
//         <div>From: {formatMoment(competition.startDate)}</div>
//         <div>To: {formatMoment(competition.endDate)}</div>
//         <div>Winners number: 5</div>
//     </div>
}