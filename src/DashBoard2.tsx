import React from 'react';
import Sheet from '@mui/joy/Sheet';
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Card, CardContent, Typography, Avatar, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface DashboardProps {
    imageUrl: string;
    serverName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ imageUrl, serverName }) => {
    const navigate = useNavigate()
    const location = useLocation();
    const myData = location.state?.serverName || '----';
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
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="60vh"
            >
                <Avatar src={imageUrl} alt="Server" sx={{ width: 150, height: 150 }} onClick={() => {
                    //setUrlToStorage("38.154.227.167:5868")
                    //navigate("/serverList")
                    //chrome.runtime.sendMessage({ action: 'setProxy', url: '38.154.227.167:5868' });
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
                        {/* <ArrowBackIcon style={{ transform: 'rotate(180deg)' }} /> */}
                        <Typography variant="body2">
                            {myData}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Sheet>
    );
};


export default Dashboard;

