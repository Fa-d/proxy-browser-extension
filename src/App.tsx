import { useEffect, useState } from "react";
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import LoginFinal from "./LoginFrom";
import DashBoard from "./DashBoard";
import { ServerList } from "./ServerList";

const App = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() => {
        const user = localStorage.getItem("user") || "true"
        if (user == "true") {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, []);

    return (
        <HashRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        loggedIn ?
                            <DashBoard
                                imageUrl={"/Users/kolpolok/webpro/proxy-browser-extension/src/assets/logo.png"}
                                serverName={"Selected server"}
                            />
                            :
                            <LoginFinal />
                    } />
                <Route path="/dashboard" element={<DashBoard imageUrl={"/Users/kolpolok/webpro/proxy-browser-extension/src/assets/logo.png"} serverName={"Selected server"} />} />
                <Route path="/serverList" element={<ServerList />} />
            </Routes>
        </HashRouter>
    );
}
export default App;


