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
import thunderImg from '../assets/thunder.png';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/joy/IconButton';

const LoginPage: React.FC = () => {
  const [inputUsername, setUsername] = React.useState('');
  const [inputPassword, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 4 }}>
            <img src={thunderImg} alt="Thunder Logo" style={{ width: 120, height: 120, objectFit: 'contain', margin: '0 auto 8px auto', display: 'block', borderRadius: 8 }} />
            <Typography level="h3" component="h1" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
              Sign in to your account
            </Typography>
            <Typography level="body-sm" sx={{ color: 'text.secondary', textAlign: 'center', mb: 2 }}>
              Welcome back! Please enter your details.
            </Typography>
            <Divider sx={{ mb: 2, borderRadius: 4 }} />
            <FormControl required sx={{ borderRadius: 4 }}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={inputUsername}
                onChange={handleUsernameChange}
                disabled={isLoading}
                size="lg"
                sx={{ borderRadius: 4 }}
                autoFocus
              />
            </FormControl>
            <FormControl required sx={{ borderRadius: 4 }}>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={inputPassword}
                onChange={handlePasswordChange}
                disabled={isLoading}
                size="lg"
                sx={{ borderRadius: 4 }}
                endDecorator={
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((show) => !show)}
                    variant="plain"
                    color="neutral"
                    size="sm"
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
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
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 16,
                py: 1.5,
                boxShadow: 'sm',
                background: '#7149DD',
                color: '#fff',
                '&:hover': { background: '#5a36b6' },
              }}
              type="submit"
              disabled={isLoading}
              fullWidth
              variant="solid"
              color="primary"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
            <Divider sx={{ my: 2, borderRadius: 4 }} />
            <Typography
              fontSize={14}
              sx={{ textAlign: 'center', color: 'text.secondary' }}
            >
              Don&apos;t have an account?{' '}
              <a
                href="https://iplockvpn.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500, borderRadius: 4 }}
              >
                Sign up
              </a>
            </Typography>
          </form>
        </Sheet>
      </main>
    </CssVarsProvider>
  );
}

export default LoginPage;