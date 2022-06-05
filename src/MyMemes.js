import {useEffect, useState} from "react";
import MyMeme from "./MyMeme";
import axios from "axios";

export default function MyMemes() {
    const [memes, setMemes] = useState()

    const isConnected = () => {
        return window.ethereum && window.ethereum.selectedAddress
    }

    const fetchMemes = async () => {
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/getmemesforaddress?address=${window.ethereum.selectedAddress}`
        return axios.get(url)
            .then((response) => {
                setMemes(response.data.memes)
                console.log(response.data.memes)
            })
    }

    const getWinners = () => {
        return memes.filter(_ => _.is_winner)
    }

    const getOpenCollectionMemes = () => {
        return memes.filter(_ => !_.is_winner)
    }

    useEffect(() => {
        if (isConnected()) {
            fetchMemes()
        }
    }, [])

    if (!isConnected() || !memes) {
        return <div>Connect your wallet</div>
    }

    return <div>
        {getWinners().length > 0 ? <div>
            <div>Winners</div>
            <div>{getWinners().map(_ => <MyMeme key={_.id} meme={_}/>)}</div>
        </div>: <div></div>}
        {getOpenCollectionMemes().length > 0 ? <div>
            <div>Open collection</div>
            <div>{getOpenCollectionMemes().map(_ => <MyMeme key={_.id} meme={_}/>)}</div>
        </div>: <div></div>}
    </div>
}