import {BrowserRouter, Route, Routes} from "react-router-dom";
import ViewImages from "./ViewImages";
import UploadImage from "./UploadImage";
import Menu from "./Menu";
import axios from "axios";
import {useEffect, useState} from "react";
import moment from "moment";

export default function App() {

    const [competitions, setCompetitions] = useState()

    const toMoment = (dateString) => {
        return moment(dateString, 'YYYY-MM-DDThh:mm:ss')
    }

    const fetchCompetitions = () => {
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/getcompetitions`
        return axios.get(url)
            .then((response) => {
                const competitions = response.data.competitions
                competitions.reverse()
                const mappedCompetitions = competitions.map(competition => {
                    return {
                        id: competition.id,
                        name: competition.name,
                        startDate: toMoment(competition.startdate),
                        endDate: toMoment(competition.enddate)
                    }
                })
                setCompetitions(mappedCompetitions)
            })
    }

    useEffect(() => {
        fetchCompetitions()
    }, [])

    if(competitions) {
        return <BrowserRouter>
            <div className="container p-4">
                <Menu competitions={competitions}/>
                <Routes>
                    <Route path="/mint" element={<UploadImage/>}/>
                    <Route path="/competition/:competitionId/:page" element={<ViewImages competitions={competitions}/>}/>
                </Routes>
            </div>
        </BrowserRouter>
    } return <div></div>
}