import {toast} from "react-toastify";
import {useState} from "react";
import "./viewImage.css";
import LoadingButton from "@mui/lab/LoadingButton";
import {Button} from "@mui/material";
import {ArrowDownward, ArrowUpward} from "@mui/icons-material";
import axios from "axios";

export default function ViewImage({meme, memeNFT}) {
    const [voteUpCount, setVoteUpCount] = useState(meme.vote_up_count);
    const [voteDownCount, setVoteDownCount] = useState(meme.vote_down_count);
    const [hide, setHide] = useState(true);
    const [voteUpInProgress, setVoteUpInProgress] = useState(false);
    const [voteDownInProgress, setVoteDownInProgress] = useState(false);

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
                        setVoteUpCount(parseInt(voteUpCount) + 1)
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

    return <div className={"padding-meme"}>
        <div className={"padding-image"}>
            <div className={"nft-id"}>
                <a href={`https://blockexplorer.boba.network/tokens/0xbcaec9c5009851a95e21d03dfa9b718d5f08e169/instance/${parseInt(meme.id)}`}
                   target="_blank">Meme NFT {parseInt(meme.id)}</a>
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
                    endIcon={<ArrowUpward/>}>{voteUpCount}</Button>}
                </span>
            {voteDownInProgress ? <LoadingButton loading loadingIndicator="Voting Down..." variant="outlined">Executing Vote Transaction</LoadingButton> : <Button
                onClick={downVote}
                variant="outlined"
                component="label"
                endIcon={<ArrowDownward/>}>{voteDownCount}</Button>}
        </div>
    </div>
}