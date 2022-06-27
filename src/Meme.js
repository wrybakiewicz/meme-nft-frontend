import {useEffect, useState} from "react";
import "./viewImage.css";
import "./viewImages.css";
import axios from "axios";
import {useParams} from "react-router-dom";
import MemeDetails from "./MemeDetails";
import CompetitionDetails from "./CompetitionDetails";

export default function Meme({competitions}) {
    const [meme, setMeme] = useState()

    useEffect(() => {
        console.log("useEffect: Meme component")
        fetchMeme()
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

    if (!meme || !competitions) {
        return <div></div>
    }


    return <div className={"center"}>
        <CompetitionDetails competition={getCompetitionForMeme()} showCompetition={true}/>
        <MemeDetails meme={meme} competition={getCompetitionForMeme()}/>
    </div>
}