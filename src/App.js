import {BrowserRouter, Route, Routes} from "react-router-dom";
import ViewImages from "./ViewImages";
import UploadImage from "./UploadImage";
import Menu from "./Menu";

export default function App() {
    return <BrowserRouter>
        <div className="container p-4">
            <Menu/>
            <Routes>
                <Route path="/mint" element={<UploadImage/>}/>
                <Route path="*" element={<ViewImages/>}/>
            </Routes>
        </div>
    </BrowserRouter>
}