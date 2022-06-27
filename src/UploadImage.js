import {useEffect, useState} from "react";
import "./uploadImage.css"
import axios from "axios";
import {toast} from "react-toastify";
import {FileUpload} from "@mui/icons-material";
import {Button} from "@mui/material";

export default function UploadImage({registrationStatus}) {
    const [image, setImage] = useState();
    const [network, setNetwork] = useState();
    const [file, setFile] = useState()
    const [uploadInProgress, setUploadInProgress] = useState(false)

    const initializeWallet = async () => {
        console.log("Initializing wallet")
        window.ethereum.request({method: 'eth_requestAccounts'});
        const chainId = await window.ethereum.request({method: 'eth_chainId'});
        console.log(chainId)
        setNetwork(chainId)
        window.ethereum.on("chainChanged", ([_]) => {
            console.log("Network changed")
            initializeWallet()
        });
    }

    const updateMemes = () => {
        axios.post("https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/update")
    }

    const onImageChange = async event => {
        if (event.target.files && event.target.files[0]) {
            const img = event.target.files[0];
            setImage(URL.createObjectURL(img));
            const buffer = await img.arrayBuffer();
            const byteArray = new Int8Array(buffer);
            setFile(byteArray)
        }
    };

    useEffect(() => {
        if (!network) {
            initializeWallet()
        }
    })

    const uploadMeme = async (event) => {
        event.preventDefault()
        setUploadInProgress(true)
        const formData = new FormData()
        formData.append("data", file)
        const config = {headers: {'content-type': 'multipart/form-data'}}
        updateMemes()
        const uploadPromise =
            axios.post(`https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/mint?address=${window.ethereum.selectedAddress}`, formData, config)
                .finally(() => {
                    document.getElementById("meme-form").reset()
                    setImage(null)
                    setUploadInProgress(false)
                })
        toast.promise(uploadPromise, {
            pending: 'Minting your meme',
            success: 'Your meme was minted 👌',
            error: 'Fail minting meme 🤯'
        });
    }

    return <div className={"center"}>
        <div>
            <div className={"middle-font"}>
                Upload meme to mint NFT
            </div>
            <div className={"center"}>
                <form id="meme-form" onSubmit={uploadMeme}>
                    <input type="file" id="image" name="img" accept="image/*" onChange={onImageChange}/>
                    <Button
                        type="submit"
                        disabled={uploadInProgress || !image || registrationStatus !== 'activated'}
                        onClick={uploadMeme}
                        variant="contained"
                        component="label"
                        endIcon={<FileUpload/>}>
                        Upload
                    </Button>
                </form>
            </div>
        </div>
        {image ? <div>
            <div className={"middle-font padding-bottom"}>Image to mint NFT from</div>
            <img className={"image"} alt={"meme"} src={image}/>
        </div> : null}
    </div>
}