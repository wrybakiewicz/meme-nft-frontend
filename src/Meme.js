import {useEffect, useState} from "react";
import "./viewImage.css";
import "./viewImages.css";
import axios from "axios";
import {useParams} from "react-router-dom";
import MemeDetails from "./MemeDetails";

export default function Meme({competitions}) {
    const [meme, setMeme] = useState()

    useEffect(() => {
        if (!meme) {
            fetchMeme()
        }
    }, [])

    const {id} = useParams();

    const fetchMeme = () => {
        let address = ''
        if (isConnected()) {
            address = `&address=${window.ethereum.selectedAddress}`
        }
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/getmemebyid?id=${id}${address}`
        return axios.get(url)
            .then((response) => {
                setMeme(response.data.meme)
            })
    }

    const isConnected = () => {
        return window.ethereum && window.ethereum.selectedAddress
    }


    const getCompetitionForMeme = () => {
        const competitionId = meme.competition_id
        return competitions.filter(_ => _.id === competitionId)[0]
    }

    const formatMoment = (moment) => {
        return moment.format('MMMM Do YYYY, h:mm:ss a')
    }

    const renderCompetition = () => {
        const competition = getCompetitionForMeme()
        return <div>
            <div>Name: {competition.name}</div>
            <div>From: {formatMoment(competition.startDate)}</div>
            <div>To: {formatMoment(competition.endDate)}</div>
        </div>
    }


    if (!meme || !competitions) {
        return <div></div>
    }


    return <div className={"center"}>
        {renderCompetition()}
        <MemeDetails meme={meme} competition={getCompetitionForMeme()}/>
    </div>
}