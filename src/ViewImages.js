import {useEffect, useState} from "react";
import {Pagination, PaginationItem} from "@mui/material";
import "./viewImages.css";
import axios from "axios";
import {Link, useParams} from "react-router-dom";
import MemeDetails from "./MemeDetails";
import CompetitionDetails from "./CompetitionDetails";

export default function ViewImages({competitions, registrationStatus}) {
    const [memes, setMemes] = useState()
    const [pages, setPages] = useState()

    const {competitionId, page} = useParams();

    useEffect(() => {
        console.log("ViewImages: Use effect")
        fetchMemes(getPageNumber())
    }, [competitionId, registrationStatus])

    const getPageNumber = () => {
        if (page) {
            return parseInt(page);
        } else {
            return 1;
        }
    }

    const getCompetition = () => {
        if (competitionId) {
            console.log(competitions)
            return competitions.filter(competition => competition.id === parseInt(competitionId))[0]
        }
    }

    const fetchMemes = (page) => {
        console.log("Fetching memes")
        const itemsPerPage = 10
        const pageSkip = page - 1
        let address = '';
        console.log("ADDRESS")
        if (window.ethereum && window.ethereum.selectedAddress) {
            address = `&address=${window.ethereum.selectedAddress}`
        }
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/getmemes?itemsPerPage=${itemsPerPage}&pagesSkip=${pageSkip}&competition=${competitionId}${address}`
        return axios.get(url)
            .then((response) => {
                setMemes(response.data.memes)
                setPages(response.data.totalPages)
            })
    }

    return <div>
        {competitionId ? <CompetitionDetails competition={getCompetition()}/> : null}

        {memes !== undefined && memes.length > 0 && pages !== undefined && competitionId ? <div>
            <div className={"center"}>
                {memes.map(meme => <MemeDetails meme={meme} key={meme.id} competition={getCompetition()} registrationStatus={registrationStatus}/>)}
            </div>
            <div>
                <Pagination
                    onChange={(e, page) => fetchMemes(page)}
                    page={getPageNumber()}
                    count={pages}
                    shape="rounded"
                    renderItem={(item) => (
                        <PaginationItem component={Link}
                                        to={`/competition/${competitionId}/${item.page}`} {...item}/>)}/>
            </div>
        </div> : null}
    </div>
}
