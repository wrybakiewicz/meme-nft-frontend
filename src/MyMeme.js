import CopyToClipboardButton from "./CopyToClipboardButton";
import "./viewImage.css";
import {Button} from "@mui/material";
import {ArrowDownward, ArrowUpward, EmojiEvents} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import {toast} from "react-toastify";
import {useState} from "react";
import deploy from "./contracts/deploy.json";
import {getLink} from "./GetLinkService"

export default function MyMeme({meme, memeNftWinner, memeNft}) {

    const [mintInProgress, setMintInProgress] = useState(false)

    const mintWinner = async () => {
        setMintInProgress(true)
        const memeNftWinnerAddress = deploy.contracts.MemeNFTWinner.address
        const isApprovedForAll = await memeNft.isApprovedForAll(window.ethereum.selectedAddress, memeNftWinnerAddress)
        console.log(isApprovedForAll)
        let setApproveForAllTx = Promise.resolve()
        if(!isApprovedForAll) {
            setApproveForAllTx = memeNft.setApprovalForAll(memeNftWinnerAddress, true).then(_ => _.wait())
        }
        const mintPromise = setApproveForAllTx.then(_ => memeNftWinner.mintFromOpenCollection(meme.id))
            .then(tx => tx.wait())
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
                <a href={getLink(meme)}
                   target="_blank">Meme NFT {parseInt(meme.id)}</a>
                <CopyToClipboardButton link={`/meme/${meme.id}`}/>
            </div>
            <img alt={""} src={meme.link}
                 style={{maxWidth: '1000px', maxHeight: '800px'}}
            />
        </div>
        <div>
            <span className={"padding-right"}>
                <Button
                    variant="outlined"
                    component="label"
                    disabled={true}
                    endIcon={<ArrowUpward/>}>{meme.vote_up_count}</Button>
                </span>
            <span className={"padding-right"}>
            <Button
                variant="outlined"
                component="label"
                disabled={true}
                endIcon={<ArrowDownward/>}>{meme.vote_down_count}</Button>
            </span>
            <span className={"padding-right"}>
                {memeNftWinner && !meme.winner_id ? mintInProgress ? <LoadingButton loading loadingIndicator="Minting..." variant="outlined">Minting Winner</LoadingButton> :
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