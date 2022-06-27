import {BrowserRouter, Route, Routes} from "react-router-dom";
import ViewImages from "./ViewImages";
import UploadImage from "./UploadImage";
import Menu from "./Menu";
import axios from "axios";
import {useEffect, useState} from "react";
import moment from "moment";
import Meme from "./Meme";
import MyMemes from "./MyMemes";
import Footer from "./Footer";
import "./App.css"

export default function App() {

    const [competitions, setCompetitions] = useState()
    const [registrationStatus, setRegistrationStatus] = useState()

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
        console.log("Use effect: APP")
        fetchCompetitions()
    }, [])

    if (competitions) {
        return <div className={"background"}>
            <BrowserRouter>
                <Menu competitions={competitions} setNewRegistrationStatus={(status) => setRegistrationStatus(status)}/>
                {registrationStatus ?
                    <div className="container p-4 margin">
                        <Routes>
                            <Route path="/mint" element={<UploadImage registrationStatus={registrationStatus}/>}/>
                            <Route path="/competition/:competitionId/:page"
                                   element={<ViewImages competitions={competitions}
                                                        registrationStatus={registrationStatus}/>}/>
                            <Route path="/meme/:id/" element={<Meme competitions={competitions}
                                                                    registrationStatus={registrationStatus}/>}/>
                            <Route path="/myMemes" element={<MyMemes competitions={competitions}
                                                                     registrationStatus={registrationStatus}/>}/>
                        </Routes>
                    </div> : null}
                <Footer/>
            </BrowserRouter>
        </div>
    }
    return <div></div>
}