import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles'; // Removed useColorScheme as ModeToggle is not used
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Sheet from '@mui/joy/Sheet';
import Button from '@mui/joy/Button';
import { Typography as MuiTypography } from '@mui/material';
// Removed useNavigate, will be handled by useAuth hook or RouterService directly if needed elsewhere
// import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth'; // Import the new hook
import { AuthCredentials } from '../../domain/repositories/AuthRepository'; // For credentials type

// ModeToggle component was here, removed as it's not used in the login form itself.
// If needed elsewhere, it should be a separate component.

export default function LoginPage() {
  // const navigate = useNavigate() // Replaced by useAuth's navigation
  const [inputUsername, setUsername] = React.useState('');
  const [inputPassword, setPassword] = React.useState('');
  // Error message will now come from the useAuth hook
  // const [errorMessage, setErrorMessage] = React.useState('');

  // const [showPassword, setShowPassword] = React.useState(false); // This was for PasswordInput, not currently used directly in the form

  const { login, isLoading, authError } = useAuth(); // Use the hook

  // const handleClick = () => { // For PasswordInput, not used directly
  //   setShowPassword(!showPassword);
  // };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    const credentials: AuthCredentials = { email: inputUsername, password: inputPassword };
    await login(credentials);
    // Navigation is handled within the useAuth hook after login attempt
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
            boxShadow: 'md',
          }}
          variant="outlined"
        >
          <form onSubmit={handleSubmit}> {/* Wrap in a form element */}
            <div>
              <Typography level="h4" component={'h1'}>
                <b>Welcome!</b>
              </Typography>
              <Typography level="body-sm">Sign In to continue</Typography>
            </div>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                placeholder="example@email.com"
                value={inputUsername}
                onChange={handleUsernameChange}
                disabled={isLoading} // Disable input while loading
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type={'password'} // Password type, show/hide can be added back if PasswordInput component is used
                placeholder="password"
                value={inputPassword}
                onChange={handlePasswordChange}
                disabled={isLoading} // Disable input while loading
              />
            </FormControl>

            <Button sx={{ mt: 1 }} type="submit" disabled={isLoading}> {/* Set button type to submit and disable while loading */}
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
            {authError && (
              <MuiTypography fontSize="sm" color="red" sx={{ mt: 1, alignSelf: 'center' }}>
                {authError}
              </MuiTypography>
            )}

            <Typography
              fontSize="sm"
              sx={{ alignSelf: 'center' }}
            >
              Don&apos;t Have an account? {/* Sign up link can be added here if needed */}
            </Typography>
          </form>
        </Sheet>
      </main>
    </CssVarsProvider>
  );
}
