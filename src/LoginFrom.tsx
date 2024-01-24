import * as React from 'react';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Sheet from '@mui/joy/Sheet';
import Button from '@mui/joy/Button';
import { Typography as MuiTypography } from '@mui/material';
import { Navigate, Link, useNavigate } from "react-router-dom";



function ModeToggle() {
    const { mode, setMode } = useColorScheme()

    return (
        <Button
            variant="soft"
            onClick={() => {
                setMode(mode === 'light' ? 'dark' : 'light');
            }}>
            {mode === 'light' ? 'Turn dark' : 'Turn light'}
        </Button>
    );
}

export default function LoginFinal() {
    const navigate = useNavigate()
    const [inputUsername, setUsername] = React.useState('');
    const [inputPassword, setPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    return (
        <CssVarsProvider>
            <main>
                <ModeToggle />
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
                    variant='outlined'
                >
                    <div>
                        <Typography level='h4' component={'h1'}>
                            <b>Welcome!</b>
                        </Typography>
                        <Typography level='body-sm'>Sign In to continue</Typography>
                    </div>
                    <FormControl >
                        <FormLabel>Email</FormLabel>
                        <Input
                            name="email"
                            type="email"
                            placeholder="example@email.com"
                            value={inputUsername}
                            onChange={handleUsernameChange}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                            name="password"
                            type='password'
                            placeholder='password'
                            value={inputPassword}
                            onChange={handlePasswordChange}
                            //set toggle password
                            //endDecorator={<Link href="/forgot-password">Forgot Password?</Link>}      

                        />
                    </FormControl>

                    <Button sx={{ mt: 1 }}
                        onClick={() => {
                            console.log(inputUsername)
                            console.log(inputPassword)
                            if (inputUsername === "admin" && inputPassword === "admin") {
                                localStorage.setItem("user", JSON.stringify({ token: true }));
                                navigate("/dashboard")
                            } else {
                                setErrorMessage('Invalid username or password');
                            }
                        }}>Log In
                    </Button>
                    {errorMessage && (
                        <MuiTypography  fontSize='sm' color="red" sx={{ mt: 1, alignSelf: 'center',  }}>
                            {errorMessage}
                        </MuiTypography>
                    )}

                    <Typography
                        //endDecorator={<Link href="/sign-up">Sign UP</Link>}
                        fontSize='sm'
                        sx={{ alignSelf: 'center' }}
                    >Don&apos;t Have an account
                    </Typography>
                </Sheet>
            </main>
        </CssVarsProvider>
    )
}

