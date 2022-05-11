import {toast} from "react-toastify";
import {useState} from "react";
import "./viewImage.css";
import LoadingButton from "@mui/lab/LoadingButton";
import {Button} from "@mui/material";
import {ArrowDownward, ArrowUpward} from "@mui/icons-material";

export default function ViewImage({meme, memeNFT}) {
    const [voteUpCount, setVoteUpCount] = useState(meme.vote_up_count);
    const [voteDownCount, setVoteDownCount] = useState(meme.vote_down_count);
    const [hide, setHide] = useState(true);
    const [voteUpInProgress, setVoteUpInProgress] = useState(false);
    const [voteDownInProgress, setVoteDownInProgress] = useState(false);

    const upVote = async () => {
        setVoteUpInProgress(true)
        const upVote = memeNFT.voteUp(meme.id)
            .then(tx => tx.wait())
            .then(_ => {
                setVoteUpCount(parseInt(voteUpCount) + 1)
                setVoteUpInProgress(false)
            })
            .catch(error => {
                console.error(error)
                setVoteUpInProgress(false)
                throw error;
            })
        toast.promise(upVote, {
            pending: 'Up vote transaction in progress',
            success: 'Up vote transaction succeed 👌',
            error: 'Up vote transaction failed 🤯'
        });
    }

    const downVote = async () => {
        setVoteDownInProgress(true)
        const downVotePromise = memeNFT.voteDown(meme.id)
            .then(tx => tx.wait())
            .then(_ => {
                setVoteDownCount(parseInt(voteDownCount) + 1)
                setVoteDownInProgress(false)
            })
            .catch(error => {
                console.error(error)
                setVoteDownInProgress(false)
                throw error;
            })
        toast.promise(downVotePromise, {
            pending: 'Down vote transaction in progress',
            success: 'Down vote transaction succeed 👌',
            error: 'Down vote transaction failed 🤯'
        });
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