import {useEffect, useState} from "react";
import {Button, Pagination, PaginationItem} from "@mui/material";
import "./viewImages.css";
import {Modal} from "react-bootstrap";
import axios from "axios";
import { toast } from 'react-toastify';
import ViewImage from "./ViewImage";
import {Link, useParams} from "react-router-dom";

export default function ViewImages({competitions}) {
    const [show, setShow] = useState(false)
    const [registrationStatus, setRegistrationStatus] = useState('unknown')
    const [email, setEmail] = useState('')
    const [activationCode, setActivationCode] = useState('')
    const [memes, setMemes] = useState()
    const [pages, setPages] = useState()

    const handleOpen = () => setShow(true)
    const handleClose = () => setShow(false)

    const initializeWallet = async () => {
        await window.ethereum.request({method: 'eth_requestAccounts'});
        getRegistered()
    }

    const {competitionId, page} = useParams();

    useEffect(() => {
        console.log("ViewImages: Use effect")
        if (window.ethereum.selectedAddress && registrationStatus === 'unknown') {
            getRegistered()
        }
        fetchMemes(getPageNumber())
    }, [competitionId, window.ethereum.selectedAddress])

    const getPageNumber = () => {
        if (page) {
            return parseInt(page);
        } else {
            return 1;
        }
    }

    const getCompetition = () => {
        if(competitionId) {
            console.log(competitions)
            return competitions.filter(competition => competition.id === parseInt(competitionId))[0]
        }
    }

    const fetchMemes = (page) => {
        console.log("Fetching memes")
        const itemsPerPage = 2
        const pageSkip = page - 1
        let address = '';
        console.log("ADDRESS")
        console.log(window.ethereum.selectedAddress)
        if(window.ethereum.selectedAddress) {
            address = `&address=${window.ethereum.selectedAddress}`
        }
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/getmemes?itemsPerPage=${itemsPerPage}&pagesSkip=${pageSkip}&competition=${competitionId}${address}`
        return axios.get(url)
            .then((response) => {
                setMemes(response.data.memes)
                setPages(response.data.totalPages)
            })
    }

    const getRegistered = () => {
        const address = window.ethereum.selectedAddress
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/getregistrationstatus/${address}`
        return axios.get(url)
            .then((response) => {
                console.log("Registration status: " + response.data.status)
                setRegistrationStatus(response.data.status)
                return response.data.status
            })
    }

    const sendActivationCode = () => {
        console.log("Sending activation code after metamask verify " + email)
        const msgParams = JSON.stringify({
            domain: {
                chainId: 137,
                name: 'Meme NFT',
                //TODO
                verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
                version: '1',
            },
            message: {
                email: email,
            },
            primaryType: 'Mail',
            types: {
                Mail: [
                    {name: 'email', type: 'string'},
                ]
            },
        });
        console.log(msgParams)
        const params = [window.ethereum.selectedAddress, msgParams]
        window.ethereum.sendAsync({
            method: 'eth_signTypedData_v4',
            params: params,
            from: window.ethereum.selectedAddress
        }, (error, response) => {
            if (error) {
                console.log("Error " + error)
            } else {
                console.log("Signature success " + response)
                const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/sendactivationcode`
                const sendEmailPromise = axios.post(url, {
                    signature: response.result,
                    params: msgParams
                })
                    .then((response) => {
                        console.log("Sent activation code: " + response);
                    })
                toast.promise(sendEmailPromise, {
                    success: 'Email sent 👌',
                });
            }
        })
    }

    const activateAccount = () => {
        console.log("Activating account " + activationCode + " email: " + email)
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/activate`
        const activatePromise = axios.post(url, {
            email: email,
            activationCode: activationCode
        })
            .then((response) => {
                console.log("Activated: " + response);
                getRegistered()
            }).catch(_ => getRegistered()).then(status => {
                if(status !== 'activated') {
                    console.log("NOT ACTIVATED")
                    throw Error("Not activated")
                } else {
                    console.log("ACTIVATED")
                    handleClose()
                }
        })
        toast.promise(activatePromise, {
            success: 'Activated 👌',
            error: 'Invalid activation code 🤯'
        });
    }

    const renderRegistration = () => {
        if (registrationStatus === 'unknown' || registrationStatus === 'activated') {
            return <div className={"center"}><Button disabled>Connected</Button></div>
        } else {
            //TODO: notRegistered/emailSent
            return <div className={"center"}><Button onClick={_ => handleOpen()}>Register</Button></div>
        }
    }

    const formatMoment = (moment) => {
        return moment.format('MMMM Do YYYY, h:mm:ss a')
    }

    const renderCompetition = () => {
        const competition = getCompetition()
        return <div>
            <div>Name: {competition.name}</div>
            <div>From: {formatMoment(competition.startDate)}</div>
            <div>To: {formatMoment(competition.endDate)}</div>
        </div>
    }

    return <div>
        {window.ethereum && window.ethereum.selectedAddress ? renderRegistration()
            :
            <div className={"center"}><Button onClick={_ => initializeWallet()}>Connect</Button></div>}
        {!window.ethereum ? <div className={"center"}>Install Metamask</div> : null}

        {competitionId ? renderCompetition() : null}

        {memes !== undefined && memes.length > 0 && pages !== undefined && competitionId ? <div>
            <div className={"center"}>
                {memes.map(meme => <ViewImage meme={meme} key={meme.id} competition={getCompetition()}/>)}
            </div>
            <div>
                <Pagination
                    onChange={(e, page) => fetchMemes(page)}
                    page={getPageNumber()}
                    count={pages}
                    shape="rounded"
                    renderItem={(item) => (
                        <PaginationItem component={Link} to={`/competition/${competitionId}/${item.page}`} {...item}/>)}/>
            </div>
        </div>: null}

        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Register</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <div>Input your mail</div>
                    <div>
                        <input type='text' value={email} onChange={e => setEmail(e.target.value)}/>
                        {registrationStatus === 'email_sent' ? null :
                        <Button variant="secondary" onClick={sendActivationCode}>
                            Send
                        </Button>}
                    </div>
                </div>
                <div>
                    <div>Input your activation code</div>
                    <div>
                        <input type='text' value={activationCode} onChange={e => setActivationCode(e.target.value)}/>
                        <Button variant="secondary" onClick={activateAccount}>
                            Activate
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    </div>
}
