import React from 'react';
import Sheet from '@mui/joy/Sheet';
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Card, CardContent, Typography, Avatar } from '@mui/material';
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
    //   setInterval(showSpeed, 5000);
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
                maxHeight: 500,
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
                    }}
                >
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
                <Card sx={{ mt: 10, width: 300 }} onClick={() => {
                    navigate("/serverList")
                }}>
                    <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="h5" component="div">
                                {serverName}
                            </Typography>
                        </Box>
                        <Typography variant="body2">
                            {myData}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Sheet>
    );
};

function showSpeed() {
    chrome.runtime.sendMessage({ action: 'getSpeed' }, (response) => {
        console.log(response);
    });
}

export default Dashboard;

