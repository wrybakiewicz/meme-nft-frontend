import {toast} from "react-toastify";
import {useEffect, useState} from "react";
import "./viewImage.css";
import LoadingButton from "@mui/lab/LoadingButton";
import {Button} from "@mui/material";
import {ArrowDownward, ArrowUpward} from "@mui/icons-material";
import axios from "axios";
import moment from "moment";
import CopyToClipboardButton from "./CopyToClipboardButton";

export default function ViewImage({meme, competition}) {
    const [voteUpCount, setVoteUpCount] = useState(meme.vote_up_count);
    const [voteDownCount, setVoteDownCount] = useState(meme.vote_down_count);
    const [votedUp, setVotedUp] = useState(meme.votedUp)
    const [votedDown, setVotedDown] = useState(meme.votedDown)
    const [hide, setHide] = useState(true);
    const [voteUpInProgress, setVoteUpInProgress] = useState(false);
    const [voteDownInProgress, setVoteDownInProgress] = useState(false);

    useEffect(() => {
        setVotedUp(meme.votedUp)
        setVotedDown(meme.votedDown)
    }, [meme.votedUp, meme.votedDown])

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

    const isConnected = () => {
        return window.ethereum && window.ethereum.selectedAddress
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
                        setVoteUpCount(parseInt(voteUpCount) + 1)
                        if(votedDown) {
                            setVoteDownCount(parseInt(voteDownCount) - 1)
                            setVotedDown(false)
                            setVotedUp(true)
                        }
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
                        setVoteDownCount(parseInt(voteDownCount) + 1)
                        if(votedUp) {
                            setVoteUpCount(parseInt(voteUpCount) - 1)
                            setVotedUp(false)
                            setVotedDown(true)
                        }
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

    const isCompetitionActive = () => {
        return moment().isBefore(competition.endDate) && moment().isAfter(competition.startDate)
    }

    return <div className={"padding-meme"}>
        <div className={"padding-image"}>
            <div className={"nft-id"}>
                <a href={`https://polygonscan.com/token/0x1e7a8719b99ac4e23c42e87671fc6d2a7d96a750?a=${parseInt(meme.id)}`}
                   target="_blank">Meme NFT {parseInt(meme.id)}</a>
                <CopyToClipboardButton link={`/meme/${meme.id}`}/>
            </div>
            <img alt={""} src={`https://arweave.net/${meme.link}`}
                 onLoad={() => setHide(false)}
                 style={{maxWidth: '1000px', maxHeight: '800px'}}
            />
        </div>
        <div hidden={hide}>
            <span className={"padding-right"}>
            {voteUpInProgress ?
                <LoadingButton loading loadingIndicator="Voting Up..." variant="outlined">Executing Vote Transaction</LoadingButton> :
                <Button
                    onClick={upVote}
                    variant="outlined"
                    component="label"
                    disabled={votedUp || !isCompetitionActive() || !isConnected()}
                    endIcon={<ArrowUpward/>}>{voteUpCount}</Button>}
                </span>
            {voteDownInProgress ? <LoadingButton loading loadingIndicator="Voting Down..." variant="outlined">Executing Vote Transaction</LoadingButton> : <Button
                onClick={downVote}
                variant="outlined"
                component="label"
                disabled={votedDown || !isCompetitionActive() || !isConnected()}
                endIcon={<ArrowDownward/>}>{voteDownCount}</Button>}
        </div>
    </div>
}