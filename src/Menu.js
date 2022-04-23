import {Link, useLocation} from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useState} from "react";
import {AutoFixHigh, Search} from "@mui/icons-material";

export default function Menu() {
    const getActive = () => {
        if(location.pathname === "/mint") {
            return 1;
        } else {
            return 0;
        }
    }

    const location = useLocation();
    const [value, setValue] = useState(getActive());

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return <Tabs value={value} onChange={handleChange} aria-label="icon label tabs example" centered>
        <Tab icon={<Search />} label="VIEW" component={Link} to="/"/>
        <Tab icon={<AutoFixHigh />} label="MINT" component={Link} to="/mint" />
    </Tabs>
}