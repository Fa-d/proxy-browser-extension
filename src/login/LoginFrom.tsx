import * as React from 'react';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Sheet from '@mui/joy/Sheet';
import Button from '@mui/joy/Button';
import { Typography as MuiTypography } from '@mui/material';
import { useNavigate } from "react-router-dom";


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
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClick = () => {
        setShowPassword(!showPassword);
    };

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

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
                        maxHeight: 500,
                        flexDirection: 'column',
                        gap: 2,
                        borderRadius: 'sm',
                        boxShadow: 'md'
                    }}
                    variant='outlined' >
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

                    {/* <PasswordInput
                        password={inputPassword}
                        handlePassword={(e) => setPassword(e.target.value)}
                    /> */}
                    <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder='password'
                            value={inputPassword}
                            onChange={handlePasswordChange}
                        // endDecorator={
                        //     <PasswordToggle
                        //         showPassword={showPassword}
                        //         onClick={handleClick}
                        //     />}
                        />
                    </FormControl>

                    <Button sx={{ mt: 1 }}
                        onClick={() => {
                            if (inputUsername === "admin" && inputPassword === "admin") {
                                localStorage.setItem("user", "true");
                                navigate("/dashboard")
                            } else {
                                setErrorMessage('Invalid username or password');
                            }
                        }}>Log In
                    </Button>
                    {errorMessage && (
                        <MuiTypography fontSize='sm' color="red" sx={{ mt: 1, alignSelf: 'center' }}>
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

