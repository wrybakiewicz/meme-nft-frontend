import {ApolloClient, gql, InMemoryCache} from "@apollo/client";
import {useEffect, useState} from "react";
import ViewImage from "./ViewImage";
import {ethers} from "ethers";
import contractAddress from "./contracts/contract-address.json";
import MemeNFTArtifact from "./contracts/MemeNFT.json";
import {Pagination, PaginationItem} from "@mui/material";
import {Link, useParams} from "react-router-dom";
import "./viewImages.css";

export default function ViewImages() {
    const itemsPerPage = 4;
    const client = new ApolloClient({
        uri: 'https://graph.mainnet.boba.network/subgraphs/name/wrybakiewicz/memeNFTBoba',
        cache: new InMemoryCache()
    });

    const [memeNFT, setMemeNFT] = useState();
    const [memes, setMemes] = useState();
    const [totalItems, setTotalItems] = useState();
    const [network, setNetwork] = useState();

    const params = useParams();

    const getPageNumber = () => {
        if (params["*"]) {
            return parseInt(params["*"]);
        } else {
            return 1;
        }
    }

    const initializeEthers = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const memeNFTContract = new ethers.Contract(
            contractAddress.MemeNFT,
            MemeNFTArtifact.abi,
            provider.getSigner(0)
        );
        setMemeNFT(memeNFTContract)
        return memeNFTContract
    }

    const updateTotalItems = async (memeNFT) => {
        const totalItems = await memeNFT.totalSupply();
        setTotalItems(totalItems.toNumber());
    }

    const initializeWallet = async () => {
        window.ethereum.request({method: 'eth_requestAccounts'});
        const chainId = await window.ethereum.request({method: 'eth_chainId'});
        setNetwork(chainId)
        window.ethereum.on("chainChanged", ([_]) => {
            initializeEth();
            initializeMemes();
        });
    }

    const query = (page) => {
        client
            .query({
                query: gql`{
                            memeEntities(first: ${itemsPerPage}, skip: ${(page - 1) * itemsPerPage}, orderBy: voteCount, orderDirection: desc) {
                              id
                              voteCount
                              link
                              voteUp
                              voteDown
                             }
                            }`
            })
            .then(result => setMemes(result.data.memeEntities));
    }

    const initializeEth = () => {
        initializeWallet().then(_ => initializeEthers()).then(memeNFT => updateTotalItems(memeNFT))
    }

    const initializeMemes = () => {
        query(getPageNumber());
    }

    useEffect(() => {
        if (!memeNFT && window.ethereum) {
            initializeEth()
        }
        if (!memes) {
            initializeMemes();
        }
    })

    if (window.ethereum === undefined) {
        return <div className={"center-warning"}>Install ethereum wallet</div>;
    } else if (network !== "0x120") {
        return <div className={"center-warning"}>Change network to Boba</div>
    } else if (memes && memeNFT && totalItems) {
        return <div>
            <div className={"center"}>
                {memes.map(meme => <ViewImage meme={meme} key={meme.id} memeNFT={memeNFT}/>)}
            </div>
            <div>
                <Pagination
                    onChange={(e, page) => query(page)}
                    page={getPageNumber()}
                    count={Math.ceil((1.0 * totalItems) / itemsPerPage)}
                    shape="rounded"
                    renderItem={(item) => (
                        <PaginationItem component={Link} to={item.page === 1 ? '' : `/${item.page}`} {...item}/>)}/>
            </div>
        </div>
    } else {
        return <div></div>
    }
}
