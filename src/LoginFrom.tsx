import * as React from 'react';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Sheet from '@mui/joy/Sheet';
import Button from '@mui/joy/Button';
import { flexbox, width } from '@mui/system';
import { auto } from '@popperjs/core';
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
                        minHeight: 720,
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
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                            name="password"
                            type='password'
                            placeholder='password'
                        />
                    </FormControl>

                    <Button
                        sx={{ mt: 1 }}
                        onClick={() => {
                            navigate("/dashboard")
                            // <Navigate to="/dashboard" replace={true} />

                        }}
                    >Log In</Button>
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

