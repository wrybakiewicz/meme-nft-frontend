import "./viewImage.css";
import MemeDetails from "./MemeDetails";

export default function MyMeme({meme, memeNftWinner, memeNft, competitions}) {

    const getCompetitionForMeme = () => {
        const competitionId = meme.competition_id
        return competitions.filter(_ => _.id === competitionId)[0]
    }
    return <MemeDetails meme={meme} competition={getCompetitionForMeme()} memeNft={memeNft}
                        memeNftWinner={memeNftWinner}/>
}