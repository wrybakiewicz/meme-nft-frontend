import deploy from "./contracts/deploy.json";

const polygonScanLink = "https://polygonscan.com/token/";

const getLink = (meme) => {
    if (meme.is_winner && meme.winner_id) {
        return polygonScanLink + deploy.contracts.MemeNFTWinner.address + "?a=" + meme.winner_id
    } else {
        return polygonScanLink + deploy.contracts.MemeNFTOpen.address + "?a=" + meme.id
    }
}

export {getLink}