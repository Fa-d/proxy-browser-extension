import { useEffect, useState } from "react";
import { HashRouter, Route, Routes } from 'react-router-dom';
import LoginFinal from "./login/LoginFrom";
import DashBoard from "./DashBoard";
import { ServerList } from "./ServerList";

const App = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() => {
        setLoggedInState();
    }, []);

    function setLoggedInState() {
        const user = localStorage.getItem("user") || "true"
        if (user == "true") {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
        console.log("logged in state: " + loggedIn);
    }

    return (
        <HashRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        localStorage.getItem("user") == 'true' ?
                            <DashBoard
                                lState={setLoggedInState}
                                imageUrl={"/Users/kolpolok/webpro/proxy-browser-extension/src/assets/logo.png"}
                                serverName={"Selected server"}
                            /> : <LoginFinal />
                    } />
                <Route path="/dashboard" element={<DashBoard
                    lState={setLoggedInState}
                    imageUrl={"/Users/kolpolok/webpro/proxy-browser-extension/src/assets/logo.png"} serverName={"Selected server"} />} />
                <Route path="/serverList" element={<ServerList />} />

            </Routes>
        </HashRouter>
    );
}
export default App;


