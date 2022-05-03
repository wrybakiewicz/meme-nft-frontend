import {useEffect, useState} from "react";
import {Button} from "@mui/material";
import "./viewImages.css";
import {Modal} from "react-bootstrap";
import axios from "axios";

export default function ViewImages() {
    const [show, setShow] = useState(false)
    const [registrationStatus, setRegistrationStatus] = useState('unknown')
    const [email, setEmail] = useState('')
    const [activationCode, setActivationCode] = useState('')

    const handleOpen = () => setShow(true)
    const handleClose = () => setShow(false)

    const initializeWallet = async () => {
        await window.ethereum.request({method: 'eth_requestAccounts'});
        getRegistered()
    }

    useEffect(() => {
        if(window.ethereum.selectedAddress && registrationStatus === 'unknown') {
            getRegistered()
        }
    })

    const getRegistered = () => {
        const address = window.ethereum.selectedAddress
        const url = `https://ibn51vomli.execute-api.eu-central-1.amazonaws.com/prod/getregistrationstatus/${address}`
        axios.get(url)
            .then((response) => {
                console.log("Registration status: " + response.data.status);
                setRegistrationStatus(response.data.status)
            })
    }

    const sendActivationCode = () => {
        console.log("Sending activation code after metamask verify " + email)
        //TODO: verify signature
        //TODO: call endpoint
    }

    const activateAccount = () => {
        console.log("Activating account " + activationCode)
        //TODO: call endpoint
    }

    const renderRegistration = () => {
        if(registrationStatus === 'unknown' || registrationStatus === 'activated') {
            return <div className={"center"}><Button disabled>Connected</Button></div>
        } else {
            return <div className={"center"}><Button onClick={_ => handleOpen()}>Register</Button></div>
        }
    }


    return <div>
        {window.ethereum && window.ethereum.selectedAddress ? renderRegistration()
            :
            <div className={"center"}><Button onClick={_ => initializeWallet()}>Connect</Button></div>}
        {!window.ethereum ? <div className={"center"}>Install Metamask</div> : null}

        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Register</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <div>Input your mail to register</div>
                    <div>
                        <input type='text' value={email} onChange={e => setEmail(e.target.value)}/>
                        <Button variant="secondary" onClick={sendActivationCode}>
                            Send
                        </Button>
                    </div>
                </div>
                {/**TODO: hide if code sent*/}
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
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    </div>
}
