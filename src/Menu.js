import {Link, useLocation, useNavigate} from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useEffect, useState} from "react";
import {AutoFixHigh, Search} from "@mui/icons-material";

export default function Menu({competitions}) {
    const getActive = () => {
        if (location.pathname === "/mint") {
            return competitions.length;
        } else if(location.pathname.startsWith("/meme")) {
            return false
        } else if(location.pathname === "/myMemes") {
            return competitions.length + 1
        } else {
            const competitionIdPageUrl = location.pathname.substring("/competition/".length)
            const competitionId = competitionIdPageUrl.substring(0, competitionIdPageUrl.indexOf("/"))
            const competitionIds = competitions.map(_ => _.id)
            return competitionIds.indexOf(parseInt(competitionId));
        }
    }

    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = useState(false);

    const redirectToLatestCompetition = () => {
        console.log(location.pathname)
        if (location.pathname === "/") {
            const newUrl = "/competition/" + competitions[0].id + "/1"
            navigate(newUrl)
        }
    }

    useEffect(() => {
        redirectToLatestCompetition()
        setValue(getActive)
    }, [location.pathname])


    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return <Tabs value={value} onChange={handleChange} aria-label="icon label tabs example" centered>
        {competitions.map(competition => <Tab key={competition.id} icon={<Search/>} label={competition.name}
                                              component={Link} to={"/competition/" + competition.id + "/1"}/>)}
        <Tab icon={<AutoFixHigh/>} label="MINT" component={Link} to="/mint"/>
        <Tab icon={<AutoFixHigh/>} label="My Memes" component={Link} to="/myMemes"/>
    </Tabs>
}