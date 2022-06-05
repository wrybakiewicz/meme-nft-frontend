import {useEffect, useState} from "react";
import CopyToClipboardButton from "./CopyToClipboardButton";
import "./viewImage.css";
import LoadingButton from "@mui/lab/LoadingButton";
import {Button} from "@mui/material";
import {ArrowDownward, ArrowUpward} from "@mui/icons-material";

export default function MyMeme({meme}) {
    useEffect(() => {
    }, [])

    return <div className={"padding-meme center"}>
        <div className={"padding-image"}>
            <div className={"nft-id"}>
                <a href={`https://polygonscan.com/token/0x1e7a8719b99ac4e23c42e87671fc6d2a7d96a750?a=${parseInt(meme.id)}`}
                   target="_blank">Meme NFT {parseInt(meme.id)}</a>
                <CopyToClipboardButton link={`/meme/${meme.id}`}/>
            </div>
            <img alt={""} src={`https://arweave.net/${meme.link}`}
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
            <Button
                variant="outlined"
                component="label"
                disabled={true}
                endIcon={<ArrowDownward/>}>{meme.vote_down_count}</Button>
        </div>
    </div>
}