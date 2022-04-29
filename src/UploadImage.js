import {WebBundlr} from "@bundlr-network/client";
import {useEffect, useState} from "react";
import {toast} from 'react-toastify';
import {ethers} from "ethers";
import deploy from "./contracts/deploy.json";
import "./uploadImage.css"
import {Button} from "@mui/material";
import {AttachMoney, FileUpload} from "@mui/icons-material";
import LoadingButton from '@mui/lab/LoadingButton';

export default function UploadImage() {
    const [balance, setBalance] = useState();
    const [image, setImage] = useState();
    const [imageData, setImageData] = useState();
    const [cost, setCost] = useState();
    const [uploaded, setUploaded] = useState(false);
    const [memeNFT, setMemeNFT] = useState();
    const [bundlr, setBundlr] = useState();
    const [tx, setTx] = useState();
    const [network, setNetwork] = useState();
    const [fundInProgress, setFundInProgress] = useState(false);
    const [uploadInProgress, setUploadInProgress] = useState(false);

    const initializeEthers = () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const memeNFTContract = new ethers.Contract(
            deploy.contracts.MemeNFTOpen.address,
            deploy.contracts.MemeNFTOpen.abi,
            provider.getSigner(0)
        );
        setMemeNFT(memeNFTContract)
        return provider
    }

    const initializeWallet = async () => {
        console.log("Initializing wallet")
        window.ethereum.request({method: 'eth_requestAccounts'});
        const chainId = await window.ethereum.request({method: 'eth_chainId'});
        setNetwork(chainId)
        window.ethereum.on("chainChanged", ([_]) => {
            console.log("Network changed")
            initialize()
        });
    }

    const initialiseBundlr = async (provider) => {
        const bundlr = new WebBundlr("https://devnet.bundlr.network", "matic", provider, {providerUrl: "https://matic-mumbai.chainstacklabs.com"});
        await bundlr.ready();
        setBundlr(bundlr);
        return bundlr;
    }

    const updateBalance = async (bundlr) => {
        const execute = (n) => {
            setTimeout(async () => {
                const balance = await bundlr.getLoadedBalance();
                setBalance(balance.toNumber());
                if (n < 10) {
                    return execute(n + 1)
                }
            }, 1000 * n);
        }

        execute(0)
    }

    const fund = async () => {
        try {
            await fundUnsafe()
        } catch (e) {
            setFundInProgress(false);
            throw e;
        }
    }

    const fundUnsafe = async () => {
        setFundInProgress(true);
        const tx = bundlr.createTransaction(imageData)
        setTx(tx);
        const size = tx.size
        const cost = await bundlr.getPrice(size)
        const fundStatus = await bundlr.fund(cost.multipliedBy(1.05).decimalPlaces(0))
        console.log(fundStatus)
        updateBalance(bundlr)
        setFundInProgress(false);
    }

    const updateCost = async (imageData) => {
        const tx = bundlr.createTransaction(imageData)
        const size = tx.size
        const cost = await bundlr.getPrice(size)
        setCost(cost.toNumber())
    }

    const upload = async () => {
        try {
            await uploadUnsafe();
        } catch (e) {
            setUploadInProgress(false);
            throw e;
        }
    }

    const uploadUnsafe = async () => {
        setUploadInProgress(true)
        let transaction;
        if (transaction) {
            transaction = tx;
        } else {
            transaction = bundlr.createTransaction(imageData);
        }
        await transaction.sign();
        const result = await transaction.upload();
        console.log("Uploaded image to bundlr: " + result.data.id)
        const mintPromise = memeNFT.mint(result.data.id)
            .then(tx => tx.wait())
        toast.promise(mintPromise, {
            pending: 'Mint transaction in progress',
            success: 'Mint transaction succeed 👌',
            error: 'Mint transaction failed 🤯'
        });
        mintPromise.then(_ => {
            setUploaded(true)
            setUploadInProgress(false)
        }).catch(e => {
            setUploadInProgress(false);
            throw e;
        })
    }

    const onImageChange = async event => {
        if (event.target.files && event.target.files[0]) {
            const img = event.target.files[0];
            setImage(URL.createObjectURL(img));
            const buffer = await img.arrayBuffer();
            const byteArray = new Int8Array(buffer);
            setImageData(byteArray);
            await updateCost(byteArray);
        }
    };

    const initialize = () => {
        initializeWallet().then(_ => {
            const provider = initializeEthers();
            initialiseBundlr(provider).then(bundlr => updateBalance(bundlr));
        })
    }

    useEffect(() => {
        if (!network) {
            initialize()
        }
    })

    if (window.ethereum === undefined) {
        return <div className={"center-warning"}>Install ethereum wallet</div>;
    } else if (network !== "0x13881") {
        return <div className={"center-warning"}>Change network to Boba</div>
    } else if (balance !== undefined && bundlr && !uploaded && memeNFT) {
        return <div className={"center"}>
            {image ? <div></div> : <div>
                <div className={"middle-font"}>
                    Upload image to mint NFT
                </div>
                <div className={"center"}>
                    <Button
                        variant="contained"
                        component="label"
                        endIcon={<FileUpload />}>
                        Upload
                        <input type="file" id="image" name="img" accept="image/*" onChange={onImageChange} hidden/>
                    </Button>
                </div>
            </div>}
            {cost > balance && image ? <div>
                <div className={"middle-font"}>You need to fund your Bundlr account to mint an NFT</div>
                <div className={"padding"}>
                    {fundInProgress ? <LoadingButton loading loadingIndicator="Funding..." variant="outlined">Funding account</LoadingButton> : <Button
                        onClick={fund}
                        variant="contained"
                        component="label"
                        endIcon={<AttachMoney />}>
                        Fund my account
                    </Button>}
                </div>
            </div> : <div></div>}
            {balance > cost && image ? <div>
                <div className={"middle-font"}>Upload image to Bundlr to mint an NFT</div>
                <div className={"padding"}>
                    {uploadInProgress ? <LoadingButton loading loadingIndicator="Minting..." variant="outlined">Minting NFT</LoadingButton> :
                        <Button
                            onClick={upload}
                            variant="contained"
                            component="label"
                            endIcon={<FileUpload />}>
                            Mint meme as NFT
                        </Button>}
                </div>
            </div> : <div></div>}
            {image ?
                <div>
                    <div className={"middle-font padding-bottom"}>Image to mint NFT from</div>
                    <img className={"image"} alt={""} src={image}/>
                </div> : <div></div>}
        </div>
    } else if (uploaded) {
        return <div className={"center-warning"}>Your NFT was minted ! You can view it now</div>
    } else {
        return <div className={"center-warning"}>Sign message to mint meme NFT</div>
    }
}