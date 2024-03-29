import React from 'react';
import Sheet from '@mui/joy/Sheet';
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Card, CardContent, Typography, Avatar, CircularProgress, IconButton, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Toolbar from '@mui/material/Toolbar';
import { Logout } from '@mui/icons-material'
import Lottie from "lottie-react";
import animationPassedData from "./assets/connecting.json";
import { CloudUploadOutlined, CloudDownloadRounded } from '@mui/icons-material';

interface DashboardProps {
    imageUrl: string;
    serverName: string;
    lState: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ imageUrl, serverName, lState }) => {
    const navigate = useNavigate()
    const location = useLocation();
    const shouldConnectOtherPage = location.state?.shouldConnect || 'false'
    const [showLatestIP, setLatestIP] = React.useState('');
    const [isConnected, setIsConnected] = React.useState(false);
    const [isConnectPressed, setIsConnectPressed] = React.useState(false);

    React.useEffect(() => { setConnectedState() }, []);

    function setConnectedState() {
        setTimeout(() => {
            chrome.proxy.settings.get({}, function (details) {
                setIsConnected(details.value.mode !== "direct");
            });
        }, 2000);
    }
    React.useEffect(() => {
        setInterval(async () => {
            const response = await fetch("https://api.sanweb.info/myip/");
            var data = await response.json();
            setLatestIP(data.ip);
        }, 2000)
    }, []);

    React.useEffect(() => {
        if (shouldConnectOtherPage == 'true') {
            connectDisconnectDecisionBattle(isConnected);
        }
    })
    return (
        <Sheet
            sx={{
                width: 300,
                mx: 'auto',
                my: 4,
                py: 3,
                px: 2,
                display: 'flex',
                minHeight: 400,
                flexDirection: 'column',
                gap: 2,
                borderRadius: 'sm',
                boxShadow: 'md'
            }}
            variant='outlined'>
            <Toolbar>
                <Logout
                    sx={{ marginLeft: 'auto' }}
                    onClick={() => {
                        localStorage.setItem("user", "false");
                        lState();
                        navigate("/");
                    }}>
                    <ArrowBackIcon />
                </Logout>
            </Toolbar>


            {isConnected ?
                <Typography variant="h5" sx={{ alignSelf: 'center', color: '#6897BB' }}>
                    {isConnectPressed ? 'Disconnecting' : 'Connected'}
                </Typography> :
                <Typography variant="h5" sx={{ alignSelf: 'center', color: '#d9534f' }}>
                    {isConnectPressed ? 'Connecting' : 'Disconnected'}
                </Typography>
            }

            {isConnectPressed ?
                <Box sx={{ width: 200, height: 200, alignSelf: 'center' }}>
                    <Lottie animationData={animationPassedData} />
                </Box> :
                <Avatar src={imageUrl} alt="Server"
                    sx={{
                        mt: 3,
                        width: 150,
                        height: 150,
                        alignSelf: 'center',
                        backgroundColor: isConnected ? '#6897BB' : '#d9534f'
                    }}
                    onClick={() => {
                        setConnectedState()
                        chrome.proxy.settings.get({}, function (details) {
                            var isConnected = details.value.mode !== "direct"
                            connectDisconnectDecisionBattle(isConnected);
                        });
                        setIsConnectPressed(true)
                        setTimeout(() => { setIsConnectPressed(false) }, 2000)
                    }} />
            }
            <Typography sx={{ mt: 3, alignSelf: 'center' }}>
                {showLatestIP.length == 0 ? (<CircularProgress />)
                    : (<Typography> Current IP: {showLatestIP} </Typography>)}
            </Typography>

            <Card sx={{ mt: 4, width: 300, minHeight: 90 }} onClick={() => {
                navigate("/serverList")
            }}>
                <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="h5" component="div">
                            {serverName}
                        </Typography>
                    </Box>
                    <Typography sx={{ mt: 2 }} variant="body2">
                        {localStorage.getItem("lastSavedServer") || ""}
                    </Typography>
                </CardContent>
            </Card>

        </Sheet>
    );
};

function showSpeed() {
    chrome.tabs.query({ active: true, currentWindow: true },
        function (tabs: chrome.tabs.Tab[]) {
            var total = 0;
            for (var i = 0; i < tabs.length; i++) {
                chrome.storage.local.get([tabs[i].id], function (result) {
                    total += result[tabs[i].id!!].bytesReceived;
                })
            }
            total = (total * 8) / 1000000;
            console.log(total);
        });
}

function connectDisconnectDecisionBattle(isConnected: Boolean) {
    const getLastUsedServer = localStorage.getItem("lastSavedServer") || ""
    if (isConnected) {
        chrome.runtime.sendMessage({ action: 'setProxy', url: '' });
    } else {
        chrome.runtime.sendMessage({ action: 'setProxy', url: getLastUsedServer });
    }
}

export default Dashboard;

