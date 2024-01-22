import * as React from 'react';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Sheet from '@mui/joy/Sheet';
import Button from '@mui/joy/Button';
import Link from '@mui/joy/Link';
import { flexbox, width } from '@mui/system';
import { auto } from '@popperjs/core';
import { Avatar } from '@mui/joy';
import { Navigate, useNavigate, useLocation } from "react-router-dom";

import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Stack,
    SvgIcon,
    CardActions,
    useTheme
} from '@mui/material';

import avatarIcon from '/Users/kolpolok/webpro/proxy-browser-extension/src/assets/logo.png';
export default function DashBoard2() {
    const navigate = useNavigate()
    const location = useLocation();
    const myData = location.state?.serverName || 'Default Value';
    return (
        <CssVarsProvider>
            <main>
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
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                    }} >
                        <Avatar src={avatarIcon} />
                    </Box>

                    <CardActions sx={{
                        justifyContent: 'space-evenly',
                        alignContent: 'flex-end',
                        flexDirection: 'row'
                    }}>
                        <Button variant="outlined"
                            onClick={() => {
                                navigate("/serverList")
                            }} >
                            {myData}
                        </Button>
                    </CardActions>
                </Sheet>
            </main>
        </CssVarsProvider>
    )
}