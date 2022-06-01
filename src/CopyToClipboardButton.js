import { useState } from "react";
import { IconButton, Snackbar } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";

const CopyToClipboardButton = ({link}) => {
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(true);
        navigator.clipboard.writeText(window.location.origin + link);
    };

    return (
        <>
            <IconButton onClick={handleClick} color="primary">
                <ShareIcon />
            </IconButton>
            <Snackbar
                message="Copied link to meme"
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                autoHideDuration={2000}
                onClose={() => setOpen(false)}
                open={open}
            />
        </>
    );
};

export default CopyToClipboardButton;