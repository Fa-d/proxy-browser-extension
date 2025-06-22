import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Sheet from '@mui/joy/Sheet';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import { Typography as MuiTypography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { AuthCredentials } from '../../domain/repositories/AuthRepository';
import { useAuthContext } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [inputUsername, setUsername] = React.useState('');
  const [inputPassword, setPassword] = React.useState('');
  const { login, isLoading, authError, currentUser } = useAuthContext();

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const credentials: AuthCredentials = { email: inputUsername, password: inputPassword };
    await login(credentials);
  }

  return (
    <CssVarsProvider>
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Sheet
          sx={{
            width: 370,
            mx: 'auto',
            py: 4,
            px: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            borderRadius: 'lg',
            boxShadow: 'lg',
            background: '#fff',
          }}
          variant="outlined"
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography level="h3" component="h1" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
              Sign in to your account
            </Typography>
            <Typography level="body-sm" sx={{ color: 'text.secondary', textAlign: 'center', mb: 2 }}>
              Welcome back! Please enter your details.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControl required>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={inputUsername}
                onChange={handleUsernameChange}
                disabled={isLoading}
                size="lg"
                sx={{ borderRadius: 'md' }}
                autoFocus
              />
            </FormControl>
            <FormControl required>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type="password"
                placeholder="Password"
                value={inputPassword}
                onChange={handlePasswordChange}
                disabled={isLoading}
                size="lg"
                sx={{ borderRadius: 'md' }}
              />
            </FormControl>
            {authError && (
              <MuiTypography fontSize={14} color="error" sx={{ mt: 1, textAlign: 'center' }}>
                {authError}
              </MuiTypography>
            )}
            <Button
              sx={{
                mt: 2,
                borderRadius: 'md',
                fontWeight: 600,
                fontSize: 16,
                py: 1.5,
                boxShadow: 'sm',
              }}
              type="submit"
              disabled={isLoading}
              fullWidth
              variant="solid"
              color="primary"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
            <Divider sx={{ my: 2 }} />
            {/* <Typography
              fontSize={14}
              sx={{ textAlign: 'center', color: 'text.secondary' }}
            >
              Don&apos;t have an account?{' '}
              <a href="#" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}>
                Sign up
              </a>
            </Typography> */}
          </form>
        </Sheet>
      </main>
    </CssVarsProvider>
  );
}

export default LoginPage;