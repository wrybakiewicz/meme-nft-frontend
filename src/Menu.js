import {Link, useNavigate, useLocation} from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useEffect, useState} from "react";
import {AutoFixHigh, Search} from "@mui/icons-material";
import axios from "axios";

export default function Menu() {
    //TODO: change based on url
    const getActive = () => {
        if(location.pathname === "/mint") {
            return 1;
        } else {
            return 0;
        }
    }

    const fetchCompetitions = () => {
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/getcompetitions`
        return axios.get(url)
            .then((response) => {
                const competitions = response.data.competitions
                console.log(competitions)
                setCompetitions(competitions)
                redirectToLatestCompetition(competitions)
            })
    }

    const redirectToLatestCompetition = (competitions) => {
        console.log(location.pathname)
        if(location.pathname === "/") {
            const newUrl = "/competition/" + competitions[competitions.length - 1].id
            console.log(newUrl)
            navigate(newUrl)
        }
    }


    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = useState(getActive());
    const [competitions, setCompetitions] = useState()

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        if(!competitions) {
            fetchCompetitions()
        }
    })

    if(competitions) {
        return <Tabs value={value} onChange={handleChange} aria-label="icon label tabs example" centered>
            {competitions.map(competition => <Tab key={competition.id} icon={<Search />} label={competition.name} component={Link} to={"/competition/" + competition.id} />)}
            <Tab icon={<AutoFixHigh />} label="MINT" component={Link} to="/mint" />
        </Tabs>
    } else {
        return <div>Loading ...</div>
    }
}