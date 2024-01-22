import React from "react";
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginFinal from "./LoginFrom";
import DashBoard from "./DashBoard2";
import { ServerList } from "./ServerList";

const App = () => {
    // const [loggedIn, setLoggedIn] = useState(false)
    // const [email, setEmail] = useState("")


    // useEffect(() => {
    //     const user = JSON.parse(localStorage.getItem("user")!!)
    //     if (!user || !user.token) {
    //         setLoggedIn(false)
    //         return
    //     }
    // }, [])

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={< LoginFinal />} />
                <Route path="/dashboard" element={< DashBoard imageUrl={"/Users/kolpolok/webpro/proxy-browser-extension/src/assets/logo.png"} serverName={"Selected server"} />} />
                <Route path="/serverList" element={< ServerList />} />
            </Routes>
        </HashRouter>
    )
}
export default App


