import {toast} from "react-toastify";
import {useEffect, useState} from "react";
import "./viewImage.css";
import "./viewImages.css";
import LoadingButton from "@mui/lab/LoadingButton";
import {Button} from "@mui/material";
import {ArrowDownward, ArrowUpward, FileUpload} from "@mui/icons-material";
import axios from "axios";
import moment from "moment";
import {useParams} from "react-router-dom";
import CopyToClipboardButton from "./CopyToClipboardButton";

export default function Meme({competitions}) {
    const [hide, setHide] = useState(true)
    const [voteUpInProgress, setVoteUpInProgress] = useState(false)
    const [voteDownInProgress, setVoteDownInProgress] = useState(false)
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

    const getMessageParams = (vote, memeId) => {
        return JSON.stringify({
            domain: {
                chainId: 137,
                name: 'Meme NFT',
                //TODO
                verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
                version: '1',
            },
            message: {
                vote: vote,
                memeId: memeId
            },
            primaryType: 'Vote',
            types: {
                Vote: [
                    {name: 'vote', type: 'string'},
                    {name: 'memeId', type: 'string'},
                ]
            },
        });
    }

    const upVote = async () => {
        setVoteUpInProgress(true)
        const msgParams = getMessageParams("UP", meme.id)
        console.log(msgParams)
        const params = [window.ethereum.selectedAddress, msgParams]
        window.ethereum.sendAsync({
            method: 'eth_signTypedData_v4',
            params: params,
            from: window.ethereum.selectedAddress
        }, (error, response) => {
            if (error) {
                console.log("Error " + error)
            } else {
                console.log("Signature success UP")
                console.log(response)
                const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/vote`
                const voteUpPromise = axios.post(url, {
                    signature: response.result,
                    params: msgParams
                })
                    .then((response) => {
                        console.log("Vote up: " + response);
                        setVoteUpInProgress(false)
                        fetchMeme()
                    }).catch(e => {
                        console.log("ERROR")
                        console.log(e)
                        setVoteUpInProgress(false)
                    })
                toast.promise(voteUpPromise, {
                    success: 'Voted up 👌',
                    error: 'Vote up failed 🤯'
                });
            }
        })
    }

    const downVote = async () => {
        setVoteDownInProgress(true)
        const msgParams = getMessageParams("DOWN", meme.id)
        console.log(msgParams)
        const params = [window.ethereum.selectedAddress, msgParams]
        window.ethereum.sendAsync({
            method: 'eth_signTypedData_v4',
            params: params,
            from: window.ethereum.selectedAddress
        }, (error, response) => {
            if (error) {
                console.log("Error " + error)
            } else {
                console.log("Signature success DOWN")
                console.log(response)
                const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/vote`
                const voteDownPromise = axios.post(url, {
                    signature: response.result,
                    params: msgParams
                })
                    .then((response) => {
                        console.log("Vote down: " + response);
                        setVoteDownInProgress(false)
                        fetchMeme()
                    }).catch(e => {
                        console.log("ERROR")
                        console.log(e)
                        setVoteDownInProgress(false)
                    })
                toast.promise(voteDownPromise, {
                    success: 'Voted down 👌',
                    error: 'Vote down failed 🤯'
                });
            }
        })
    }

    const getCompetitionForMeme = () => {
        const competitionId = meme.competition_id
        return competitions.filter(_ => _.id === competitionId)[0]
    }

    const isCompetitionActive = () => {
        const competition = getCompetitionForMeme()
        return moment().isBefore(competition.endDate) && moment().isAfter(competition.startDate)
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


    if (!meme) {
        return <div></div>
    }


    return <div className={"center"}>
        {renderCompetition()}
        <div className={"padding-meme"}>
            <div className={"padding-image"}>
                <div className={"nft-id"}>
                    <a href={`https://polygonscan.com/token/0x1e7a8719b99ac4e23c42e87671fc6d2a7d96a750?a=${parseInt(meme.id)}`}
                       target="_blank">Meme NFT {parseInt(meme.id)}</a>
                    <CopyToClipboardButton link={`/meme/${meme.id}`}/>
                </div>
                <img alt={""} src={meme.link}
                     onLoad={() => setHide(false)}
                     style={{maxWidth: '1000px', maxHeight: '800px'}}
                />
            </div>
            <div hidden={hide}>
            <span className={"padding-right"}>
            {voteUpInProgress ?
                <LoadingButton loading loadingIndicator="Voting Up..." variant="outlined">Executing Vote
                    Transaction</LoadingButton> :
                <Button
                    onClick={upVote}
                    variant="outlined"
                    component="label"
                    disabled={meme.votedUp || !isCompetitionActive() || !isConnected()}
                    endIcon={<ArrowUpward/>}>{meme.vote_up_count}</Button>}
                </span>
                {voteDownInProgress ?
                    <LoadingButton loading loadingIndicator="Voting Down..." variant="outlined">Executing Vote
                        Transaction</LoadingButton> : <Button
                        onClick={downVote}
                        variant="outlined"
                        component="label"
                        disabled={meme.votedDown || !isCompetitionActive() || !isConnected()}
                        endIcon={<ArrowDownward/>}>{meme.vote_down_count}</Button>}
            </div>
        </div>
    </div>
}