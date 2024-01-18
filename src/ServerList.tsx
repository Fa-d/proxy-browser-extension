import { Avatar, CssVarsProvider, Sheet } from '@mui/joy';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardHeader,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    SvgIcon
} from '@mui/material';
import { Navigate, useNavigate } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
export const ServerList = () => {
    const navigate = useNavigate()

    const products = ["One", "Two", "Three", "Four", "Two", "Three", "Four", "Two", "Three", "Four"];
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
                    products.map((product, index) => {
                        return (
                            <Button
                                sx={{ width: '100%' }}
                                variant='outlined'
                                onClick={() => {
                                    navigate("/dashboard", { state: { serverName: product } });
                                }}>
                                <ListItem>

                                    <ListItemAvatar>
                                        <Avatar />
                                    </ListItemAvatar>
                                    <ListItemText primary={product} />
                                </ListItem>
                            </Button>
                        )
                    })
                }
                </List>
            </Sheet>
        </main>
    );
}


