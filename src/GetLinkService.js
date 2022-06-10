import deploy from "./contracts/deploy.json";

const polygonScanLink = "https://polygonscan.com/token/";
const openseaLink = "https://opensea.io/assets/matic/";

const getScannerLink = (meme) => {
    console.log("Getting scanner link for meme: " + meme.id + " " + meme.winner_id)
    if (meme.is_winner && meme.winner_id) {
        return polygonScanLink + deploy.contracts.MemeNFTWinner.address + "?a=" + meme.winner_id
    } else {
        return polygonScanLink + deploy.contracts.MemeNFTOpen.address + "?a=" + meme.id
    }
}

const getOpenseaLink = (meme) => {
    console.log("Getting opensea for meme: " + meme.id + " " + meme.winner_id)
    if (meme.is_winner && meme.winner_id) {
        return openseaLink + deploy.contracts.MemeNFTWinner.address + "/" + meme.winner_id
    } else {
        return openseaLink + deploy.contracts.MemeNFTOpen.address + "/" + meme.id
    }
}

export {getScannerLink, getOpenseaLink}