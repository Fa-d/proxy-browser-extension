import React from 'react';
import Sheet from '@mui/joy/Sheet';
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Card, CardContent, Typography, Avatar, CircularProgress } from '@mui/material'; // Import LinearProgress from @mui/material
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Toolbar from '@mui/material/Toolbar';
import { Logout } from '@mui/icons-material'

interface DashboardProps {
    imageUrl: string;
    serverName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ imageUrl, serverName }) => {
    const navigate = useNavigate()
    const location = useLocation();
    const myData = location.state?.serverName || '----';
    const [showLatestIP, setLatestIP] = React.useState('');

    const handleLatestIP = async () => {
        const response = await fetch("https://api.sanweb.info/myip/");
        var data = await response.json();
        setLatestIP(data.ip);
    };

    setInterval(handleLatestIP, 5000);
    //setInterval(showSpeed, 1000);

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
                        console.log("logout");
                        localStorage.setItem("user", "false");
                        navigate("/")
                    }}>
                    <ArrowBackIcon />
                </Logout>
            </Toolbar>

            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="60vh"
            >
                <Avatar src={imageUrl} alt="Server" sx={{ width: 150, height: 150 }} onClick={() => {
                    chrome.runtime.sendMessage({ action: 'setProxy', url: myData });
                }} />
                <Typography sx={{ mt: 3 }}>
                    {showLatestIP.length == 0 ? (<CircularProgress />)
                        : (<Typography> Current IP: {showLatestIP} </Typography>)}
                </Typography>

                <Card sx={{ mt: 7, width: 300, minHeight: 90 }} onClick={() => {
                    navigate("/serverList")
                }}>
                    <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="h5" component="div">
                                {serverName}
                            </Typography>
                        </Box>
                        <Typography sx={{mt:2}} variant="body2">
                            {myData}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
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

export default Dashboard;

