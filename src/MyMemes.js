import {useEffect, useState} from "react";
import MyMeme from "./MyMeme";
import axios from "axios";
import {ethers} from "ethers";
import deploy from "./contracts/deploy.json";

export default function MyMemes({competitions}) {
    const [memes, setMemes] = useState()
    const [memeNftWinner, setMemeNftWinner] = useState()
    const [memeNft, setMemeNft] = useState()

    const initializeEthers = () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const memeNFTWinnerContract = new ethers.Contract(
            deploy.contracts.MemeNFTWinner.address,
            deploy.contracts.MemeNFTWinner.abi,
            provider.getSigner(0)
        );
        setMemeNftWinner(memeNFTWinnerContract)
        const memeNFTContract = new ethers.Contract(
            deploy.contracts.MemeNFTOpen.address,
            deploy.contracts.MemeNFTOpen.abi,
            provider.getSigner(0)
        );
        setMemeNft(memeNFTContract)
    }

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
            initializeEthers()
        }
    }, [])

    if (!isConnected() || !memes || !memeNftWinner) {
        return null
    }

    return <div>
        {getWinners().length > 0 ? <div>
            <div>Winners</div>
            <div>{getWinners().map(_ => <MyMeme key={_.id} meme={_} memeNftWinner={memeNftWinner} memeNft={memeNft} competitions={competitions}/>)}</div>
        </div>: <div></div>}
        {getOpenCollectionMemes().length > 0 ? <div>
            <div>Open collection</div>
            <div>{getOpenCollectionMemes().map(_ => <MyMeme key={_.id} meme={_} competitions={competitions}/>)}</div>
        </div>: <div></div>}
    </div>
}