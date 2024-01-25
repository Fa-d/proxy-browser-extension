import { Avatar, Sheet } from '@mui/joy';
import { Card, IconButton, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { useNavigate } from "react-router-dom";
import Toolbar from '@mui/material/Toolbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';

export const ServerList = () => {
    const navigate = useNavigate()
    const produvtList = [
        {
            url: "38.154.227.167:5868",
            country: "United States",
            city: "New York",
        },
        {
            url: "185.199.229.156:7492",
            country: "Spain",
            city: "Madrird",
        },
        {
            url: "185.199.228.220:7300",
            country: "Spain",
            city: "Las Rozas De Madrid",
        },
        {
            url: "185.199.231.45:8382",
            country: "Spain",
            city: "Madrid",
        },
        {
            url: "188.74.210.207:6286",
            country: "Italy",
            city: "Strada",
        },
        {
            url: "188.74.183.10:8279",
            country: "United States",
            city: "New York",
        },
        {
            url: "188.74.210.21:6100",
            country: "Italy",
            city: "Strada",
        },
        {
            url: "45.155.68.129:8133",
            country: "Italy",
            city: "Strada",
        },
        {
            url: "154.95.36.199:6893",
            country: "Netherlands",
            city: "Haarlem",
        },
        {
            url: "45.94.47.66:8110",
            country: "United States",
            city: "New York",
        },
    ];

    return (
        <main>
            <Sheet
                sx={{
                    width: 300,
                    mx: 'auto',
                    my: 4,
                    py: 3,
                    px: 2,
                    display: 'flex',
                    minHeight: 300,
                    maxHeight: 500,
                    flexDirection: 'column',
                    gap: 2,
                    borderRadius: 'sm',
                    boxShadow: 'md'
                }}
                variant='outlined'>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => {
                        navigate("/dashboard")
                    }} aria-label="back">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                        Server List
                    </Typography>
                </Toolbar>
                <List> {
                    produvtList.map((product, index) => {
                        return (
                            <Card
                                sx={{ mt: 2, width: '100%' }}
                                onClick={() => {
                                    localStorage.setItem("lastSavedServer", product.url);
                                    navigate("/dashboard", { state: { shouldConnect: 'true' } })
                                }}>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar sx={{ width: 50, height: 50 }} />
                                    </ListItemAvatar>
                                    <ListItemText primary={product.url}
                                        secondary={product.country} />
                                </ListItem>
                            </Card>
                        )
                    })
                }
                </List>
            </Sheet>
        </main>
    );
}


