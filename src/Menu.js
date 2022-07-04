import {Link, useLocation, useNavigate} from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useEffect, useState} from "react";
import {Button, Grid} from "@mui/material";
import axios from "axios";
import {toast} from "react-toastify";
import {Modal} from "react-bootstrap";
import "./Menu.css"
import Create from '@mui/icons-material/Create';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import GridView from '@mui/icons-material/GridView';

export default function Menu({competitions, setNewRegistrationStatus}) {
    const getActive = () => {
        if (location.pathname === "/mint") {
            return competitions.length;
        } else if (location.pathname.startsWith("/meme")) {
            return false
        } else if (location.pathname === "/myMemes") {
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
    const [walletInitialized, setWalletInitialized] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleOpen = () => setShow(true)
    const handleClose = () => setShow(false)

    const redirectToLatestCompetition = () => {
        if (location.pathname === "/") {
            const newUrl = "/competition/" + competitions[0].id + "/1"
            navigate(newUrl)
        }
    }

    const initializeWallet = async () => {
        setWalletInitialized(true)
        window.ethereum.request({method: 'eth_requestAccounts'});
        window.ethereum.on("chainChanged", ([_]) => {
            console.log("Network changed")
        })
        window.ethereum.on('accountsChanged', (_) => {
            console.log("Address changed")
            setRegistrationStatus('unknown')
        })
    }


    useEffect(() => {
        console.log("Use effect: Menu")
        if (!walletInitialized) {
            initializeWallet()
        }
        if (window.ethereum && window.ethereum.selectedAddress && registrationStatus === 'unknown') {
            getRegistered()
        } else if (registrationStatus === 'unknown') {
            setRegistrationStatus('notConnected')
            setNewRegistrationStatus('notConnected')
        }
        redirectToLatestCompetition()
        setValue(getActive)
        const interval = setInterval(() => setRerender(rerender + 1), 1000);
        return () => {
            clearInterval(interval);
        };
    }, [location.pathname, rerender, registrationStatus])


    const isConnected = () => {
        return window.ethereum && window.ethereum.selectedAddress && registrationStatus === 'activated'
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
                setNewRegistrationStatus(response.data.status)
                return response.data.status
            })
    }

    const sendActivationCode = () => {
        console.log("Sending activation code after metamask verify " + email)
        const msgParams = JSON.stringify({
            domain: {
                chainId: 137, name: 'Meme NFT', //TODO
                verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC', version: '1',
            }, message: {
                email: email,
            }, primaryType: 'Mail', types: {
                Mail: [{name: 'email', type: 'string'},]
            },
        });
        console.log(msgParams)
        const params = [window.ethereum.selectedAddress, msgParams]
        window.ethereum.sendAsync({
            method: 'eth_signTypedData_v4', params: params, from: window.ethereum.selectedAddress
        }, (error, response) => {
            if (error) {
                console.log("Error " + error)
            } else {
                console.log("Signature success " + response)
                const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/sendactivationcode`
                const sendEmailPromise = axios.post(url, {
                    signature: response.result, params: msgParams
                })
                    .then((response) => {
                        setEmailSent(true)
                        console.log("Sent activation code: " + response);
                    })
                toast.promise(sendEmailPromise, {
                    success: 'Email sent 👌',
                    error: 'Failed to send email 🤯'
                });
            }
        })
    }

    const activateAccount = () => {
        console.log("Activating account " + activationCode + " email: " + email)
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/activate`
        const activatePromise = axios.post(url, {
            email: email, activationCode: activationCode
        })
            .then((response) => {
                console.log("Activated: " + response);
                getRegistered()
            }).catch(_ => getRegistered()).then(status => {
                if (status !== 'activated') {
                    console.log("NOT ACTIVATED")
                    throw Error("Not activated")
                } else {
                    console.log("ACTIVATED")
                    handleClose()
                }
            })
        toast.promise(activatePromise, {
            success: 'Activated 👌', error: 'Invalid activation code 🤯'
        });
    }


    const renderConnect = () => {
        if (!window.ethereum) {
            return <Button variant="contained" disabled>Install Metamask</Button>
        } else if (!window.ethereum.selectedAddress) {
            return <Button variant="contained" onClick={_ => initializeWallet()}>Connect</Button>
        } else if (registrationStatus === 'unknown' || registrationStatus === 'activated') {
            return <Button variant="contained" disabled>Connected</Button>
        } else {
            return <Button variant="contained" onClick={_ => handleOpen()}>Register</Button>
        }
    }

    return <Grid container>
        <Grid item xs={11}>
            <Tabs value={value} onChange={handleChange} aria-label="icon label tabs example" centered>
                {competitions.map(competition => <Tab key={competition.id} icon={<GridView/>} label={competition.name}
                                                      component={Link} to={"/competition/" + competition.id + "/1"}/>)}
                {isConnected() ? <Tab icon={<Create/>} label="Create" component={Link} to="/mint"/> : null}
                {isConnected() ? <Tab icon={<AccountBalanceWallet/>} label="My Memes" component={Link} to="/myMemes"/> : null}
            </Tabs>
        </Grid>
        <Grid item xs={1} className={"connect"}>
            {renderConnect()}
        </Grid>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Register</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <div>Email</div>
                    <div>
                        <input type='text' value={email} onChange={e => setEmail(e.target.value)}/>
                        {registrationStatus === 'email_sent' || emailSent ? null :
                            <Button variant="secondary" onClick={sendActivationCode}>
                                Send
                            </Button>}
                    </div>
                </div>
                {registrationStatus === 'email_sent' || emailSent ? <div>
                    <div>Input your activation code</div>
                    <div>
                        <input type='text' value={activationCode} onChange={e => setActivationCode(e.target.value)}/>
                        <Button variant="secondary" onClick={activateAccount}>
                            Activate
                        </Button>
                    </div>
                </div> : null}
            </Modal.Body>
        </Modal>
    </Grid>
}