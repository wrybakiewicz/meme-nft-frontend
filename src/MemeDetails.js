import {getLink} from "./GetLinkService";
import CopyToClipboardButton from "./CopyToClipboardButton";
import LoadingButton from "@mui/lab/LoadingButton";
import {Button} from "@mui/material";
import {ArrowDownward, ArrowUpward, EmojiEvents} from "@mui/icons-material";
import "./viewImage.css";
import {useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import moment from "moment";
import deploy from "./contracts/deploy.json";

export default function MemeDetails({meme, competition, memeNftWinner, memeNft}) {
    const [memeState, setMemeState] = useState(meme)
    const [hide, setHide] = useState(true);
    const [voteUpInProgress, setVoteUpInProgress] = useState(false);
    const [voteDownInProgress, setVoteDownInProgress] = useState(false);
    const [votedUp, setVotedUp] = useState(meme.votedUp)
    const [votedDown, setVotedDown] = useState(meme.votedDown)
    const [voteUpCount, setVoteUpCount] = useState(meme.vote_up_count);
    const [voteDownCount, setVoteDownCount] = useState(meme.vote_down_count);
    const [mintInProgress, setMintInProgress] = useState(false)

    const updateWinners = () => {
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/updatewinningmemes`
        return axios.post(url)
    }

    const fetchMeme = () => {
        let address = ''
        if (isConnected()) {
            address = `&address=${window.ethereum.selectedAddress}`
        }
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/getmemebyid?id=${memeState.id}${address}`
        return axios.get(url)
            .then((response) => {
                setMemeState(response.data.meme)
            })
    }

    const isCompetitionActive = () => {
        return moment().isBefore(competition.endDate) && moment().isAfter(competition.startDate)
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
        const msgParams = getMessageParams("UP", memeState.id)
        console.log(msgParams)
        const params = [window.ethereum.selectedAddress, msgParams]
        window.ethereum.sendAsync({
            method: 'eth_signTypedData_v4',
            params: params,
            from: window.ethereum.selectedAddress
        }, (error, response) => {
            if (error) {
                console.log("Error " + error)
                setVoteUpInProgress(false)
                toast.error('Vote up failed 🤯')
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
                        setVotedUp(true)
                        if (votedDown) {
                            setVoteDownCount(parseInt(voteDownCount) - 1)
                            setVotedDown(false)
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
        const msgParams = getMessageParams("DOWN", memeState.id)
        console.log(msgParams)
        const params = [window.ethereum.selectedAddress, msgParams]
        window.ethereum.sendAsync({
            method: 'eth_signTypedData_v4',
            params: params,
            from: window.ethereum.selectedAddress
        }, (error, response) => {
            if (error) {
                console.log("Error " + error)
                setVoteDownInProgress(false)
                toast.error('Vote down failed 🤯')
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
                        setVotedDown(true)
                        if (votedUp) {
                            setVoteUpCount(parseInt(voteUpCount) - 1)
                            setVotedUp(false)
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

    const mintWinner = async () => {
        setMintInProgress(true)
        const memeNftWinnerAddress = deploy.contracts.MemeNFTWinner.address
        const isApprovedForAll = await memeNft.isApprovedForAll(window.ethereum.selectedAddress, memeNftWinnerAddress)
        console.log(isApprovedForAll)
        let setApproveForAllTx = Promise.resolve()
        if (!isApprovedForAll) {
            setApproveForAllTx = memeNft.setApprovalForAll(memeNftWinnerAddress, true).then(_ => _.wait())
        }
        const mintPromise = setApproveForAllTx.then(_ => memeNftWinner.mintFromOpenCollection(memeState.id))
            .then(tx => tx.wait())
            .then(_ => updateWinners())
            .then(_ => fetchMeme())
        toast.promise(mintPromise, {
            pending: 'Mint transaction in progress',
            success: 'Mint transaction succeed 👌',
            error: 'Mint transaction failed 🤯'
        });
        mintPromise.finally(_ => {
            setMintInProgress(false)
        })
    }

    return <div className={"center"}>
        <div className={"padding-meme"}>
            <div className={"padding-image"}>
                <div className={"nft-id"}>
                    <a href={getLink(memeState)}
                       target="_blank">Meme NFT {parseInt(memeState.id)}</a>
                    <CopyToClipboardButton link={`/meme/${memeState.id}`}/>
                </div>
                <img alt={""} src={memeState.link}
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
                    disabled={votedUp || !isCompetitionActive() || !isConnected()}
                    endIcon={<ArrowUpward/>}>{voteUpCount}</Button>}
                </span>
                <span className={"padding-right"}>

            {voteDownInProgress ?
                <LoadingButton loading loadingIndicator="Voting Down..." variant="outlined">Executing Vote
                    Transaction</LoadingButton> : <Button
                    onClick={downVote}
                    variant="outlined"
                    component="label"
                    disabled={votedDown || !isCompetitionActive() || !isConnected()}
                    endIcon={<ArrowDownward/>}>{voteDownCount}</Button>}
            </span>
                <span className={"padding-right"}>
                {memeNftWinner && !memeState.winner_id ? mintInProgress ?
                    <LoadingButton loading loadingIndicator="Minting..." variant="outlined">Minting
                        Winner</LoadingButton> :
                    <Button
                        onClick={mintWinner}
                        variant="outlined"
                        component="label"
                        disabled={false}
                        endIcon={<EmojiEvents/>}>{"Mint Winner"}</Button> : null}
            </span>
            </div>
        </div>
    </div>
}