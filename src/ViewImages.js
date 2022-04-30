import {useState} from "react";
import {Button} from "@mui/material";
import "./viewImages.css";
import {Modal} from "react-bootstrap";

export default function ViewImages() {
    const [connected, setConnected] = useState(false)
    const [show, setShow] = useState(false)
    const [registered, setRegistered] = useState(true)
    const [email, setEmail] = useState('')
    const [activationCode, setActivationCode] = useState('')

    const handleOpen = () => setShow(true)
    const handleClose = () => setShow(false)

    const initializeWallet = async () => {
        await window.ethereum.request({method: 'eth_requestAccounts'});
        setConnected(true)
        // setShow(true)
        getRegistered()
    }

    const getRegistered = () => {
        const address = window.ethereum.selectedAddress
        //TODO: fetch notRegistered/registered/activationCodeSent
        console.log("SET")
        setRegistered(false)
    }

    const sendActivationCode = () => {
        //TODO: verify signature
        console.log("Sending activation code after metamask verify " + email)
    }

    const activateAccount = () => {
        console.log("Activating account " + activationCode)
    }


    return <div>
        {window.ethereum && (connected || window.ethereum.selectedAddress) ?
            registered === true ? <div className={"center"}><Button disabled>Connected</Button></div> : null
            :
            <div className={"center"}><Button onClick={_ => initializeWallet()}>Connect</Button></div>}
        {window.ethereum && (connected || window.ethereum.selectedAddress) && !registered ?
            <div className={"center"}><Button onClick={_ => handleOpen()}>Register</Button></div> : null}
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
