import CopyToClipboardButton from "./CopyToClipboardButton";
import "./viewImage.css";
import {Button} from "@mui/material";
import {ArrowDownward, ArrowUpward, EmojiEvents} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import {toast} from "react-toastify";
import {useState} from "react";
import deploy from "./contracts/deploy.json";
import {getLink} from "./GetLinkService"
import axios from "axios";

export default function MyMeme({meme, memeNftWinner, memeNft}) {

    const [mintInProgress, setMintInProgress] = useState(false)
    const [memeState, setMemeState] = useState(meme)

    const updateWinners = () => {
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/updatewinningmemes`
        return axios.post(url)
    }

    const fetchMeme = () => {
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/getmemebyid?id=${memeState.id}&address=${window.ethereum.selectedAddress}`
        return axios.get(url)
            .then((response) => {
                setMemeState(response.data.meme)
            })
    }

    const mintWinner = async () => {
        setMintInProgress(true)
        const memeNftWinnerAddress = deploy.contracts.MemeNFTWinner.address
        const isApprovedForAll = await memeNft.isApprovedForAll(window.ethereum.selectedAddress, memeNftWinnerAddress)
        console.log(isApprovedForAll)
        let setApproveForAllTx = Promise.resolve()
        if(!isApprovedForAll) {
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

    return <div className={"padding-meme center"}>
        <div className={"padding-image"}>
            <div className={"nft-id"}>
                <a href={getLink(memeState)}
                   target="_blank">Meme NFT {parseInt(memeState.id)}</a>
                <CopyToClipboardButton link={`/meme/${memeState.id}`}/>
            </div>
            <img alt={""} src={memeState.link}
                 style={{maxWidth: '1000px', maxHeight: '800px'}}
            />
        </div>
        <div>
            <span className={"padding-right"}>
                <Button
                    variant="outlined"
                    component="label"
                    disabled={true}
                    endIcon={<ArrowUpward/>}>{memeState.vote_up_count}</Button>
                </span>
            <span className={"padding-right"}>
            <Button
                variant="outlined"
                component="label"
                disabled={true}
                endIcon={<ArrowDownward/>}>{memeState.vote_down_count}</Button>
            </span>
            <span className={"padding-right"}>
                {memeNftWinner && !memeState.winner_id ? mintInProgress ? <LoadingButton loading loadingIndicator="Minting..." variant="outlined">Minting Winner</LoadingButton> :
                    <Button
                        onClick={mintWinner}
                        variant="outlined"
                        component="label"
                        disabled={false}
                        endIcon={<EmojiEvents/>}>{"Mint Winner"}</Button> : null}
            </span>
        </div>
    </div>
}