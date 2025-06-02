// src/presentation/components/BottomNavLayout.tsx
import React from 'react';
import { Box, Paper } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import StorageIcon from '@mui/icons-material/Storage';
import PersonIcon from '@mui/icons-material/Person';
import { useLocation, useNavigate } from 'react-router-dom';

interface BottomNavLayoutProps {
  children: React.ReactNode;
}

const BottomNavLayout: React.FC<BottomNavLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determines the active navigation tab based on the current URL pathname.
  const getCurrentPathValue = React.useCallback(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/profile')) return '/profile';
    if (pathname.startsWith('/serverList')) return '/serverList';
    // Default to '/dashboard' for any other paths or the root.
    return '/dashboard';
  }, [location.pathname]);

  const [value, setValue] = React.useState(getCurrentPathValue());

  React.useEffect(() => {
    setValue(getCurrentPathValue());
  }, [getCurrentPathValue]); // Dependency array updated to use the memoized function

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    // No need to setValue here as the useEffect above will handle it when location.pathname changes.
    navigate(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          // Page-specific padding should be handled by the child pages themselves
        }}
      >
        {children}
      </Box>
      <Paper
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar + 1, // Ensure it's above typical app bars if any
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={handleChange}
        >
          <BottomNavigationAction
            label="Home"
            value="/dashboard" // Path used for navigation and active state
            icon={<HomeIcon />}
          />
          <BottomNavigationAction
            label="Servers"
            value="/serverList"
            icon={<StorageIcon />}
          />
          <BottomNavigationAction
            label="Profile"
            value="/profile"
            icon={<PersonIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default BottomNavLayout;
