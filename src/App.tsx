import React from "react";
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginFinal from "./LoginFrom";
import DashBoard from "./DashBoard";
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
                <Route path="/dashboard" element={< DashBoard />} />
                <Route path="/serverList" element={< ServerList />} />
            </Routes>
        </HashRouter>
    )
}
export default App


