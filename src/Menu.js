import {Link, useLocation, useNavigate} from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useEffect, useState} from "react";
import {AutoFixHigh, Search} from "@mui/icons-material";
import {Button} from "@mui/material";
import axios from "axios";
import {toast} from "react-toastify";
import {Modal} from "react-bootstrap";

export default function Menu({competitions}) {
    const getActive = () => {
        if (location.pathname === "/mint") {
            return competitions.length;
        } else if(location.pathname.startsWith("/meme")) {
            return false
        } else if(location.pathname === "/myMemes") {
            return competitions.length + 1
        } else {
            const competitionIdPageUrl = location.pathname.substring("/competition/".length)
            const competitionId = competitionIdPageUrl.substring(0, competitionIdPageUrl.indexOf("/"))
            const competitionIds = competitions.map(_ => _.id)
            return competitionIds.indexOf(parseInt(competitionId));
        }
    }

    const navigate = useNavigate()
    const location = useLocation()
    const [value, setValue] = useState(false)
    const [rerender, setRerender] = useState(0)
    const [show, setShow] = useState(false)
    const [registrationStatus, setRegistrationStatus] = useState('unknown')
    const [email, setEmail] = useState('')
    const [activationCode, setActivationCode] = useState('')

    const handleOpen = () => setShow(true)
    const handleClose = () => setShow(false)

    const redirectToLatestCompetition = () => {
        if (location.pathname === "/") {
            const newUrl = "/competition/" + competitions[0].id + "/1"
            navigate(newUrl)
        }
    }

    const initializeWallet = async () => {
        window.ethereum.request({method: 'eth_requestAccounts'});
        window.ethereum.on("chainChanged", ([_]) => {
            console.log("Network changed")
        })
        window.ethereum.on('accountsChanged', (_) => {
            console.log("Address changed")
            setRegistrationStatus('unknown')
        })
        getRegistered()
    }


    useEffect(async () => {
        console.log("Use effect: Menu")
        if (window.ethereum && window.ethereum.selectedAddress && registrationStatus === 'unknown') {
            getRegistered()
        }
        redirectToLatestCompetition()
        setValue(getActive)
        const interval = setInterval(() => setRerender(rerender + 1), 1000);
        return () => {
            clearInterval(interval);
        };
    }, [location.pathname, rerender])


    const isConnected = () => {
        return window.ethereum && window.ethereum.selectedAddress
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

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


    const renderConnect = () => {
        if(!window.ethereum) {
            return <Button disabled>Install Metamask</Button>
        } else if(!window.ethereum.selectedAddress) {
            return <Button onClick={_ => initializeWallet()}>Connect</Button>
        } else if (registrationStatus === 'unknown' || registrationStatus === 'activated') {
            return <Button disabled>Connected</Button>
        } else {
            //TODO: notRegistered/emailSent
            return <Button onClick={_ => handleOpen()}>Register</Button>
        }
    }

    return <div>
        <Tabs value={value} onChange={handleChange} aria-label="icon label tabs example" centered>
            {competitions.map(competition => <Tab key={competition.id} icon={<Search/>} label={competition.name}
                                                  component={Link} to={"/competition/" + competition.id + "/1"}/>)}
            <Tab icon={<AutoFixHigh/>} label="MINT" component={Link} to="/mint"/>
            {isConnected() ? <Tab icon={<AutoFixHigh/>} label="My Memes" component={Link} to="/myMemes"/> : null}
            {renderConnect()}
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
        </Tabs>
    </div>
}