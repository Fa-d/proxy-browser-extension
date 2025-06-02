// src/presentation/components/BottomNavLayout.tsx
import React from 'react';
import { Box, Paper } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import StorageIcon from '@mui/icons-material/Storage'; // Or DnsIcon, ListIcon, LanguageIcon
import PersonIcon from '@mui/icons-material/Person';
import { useLocation, useNavigate } from 'react-router-dom';

interface BottomNavLayoutProps {
  children: React.ReactNode;
}

const BottomNavLayout: React.FC<BottomNavLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine the current value for BottomNavigation based on the path
  // The value should correspond to the path for navigation
  const getCurrentPathValue = () => {
    const pathname = location.pathname;
    if (pathname.startsWith('/profile')) return '/profile';
    if (pathname.startsWith('/serverList')) return '/serverList';
    if (pathname.startsWith('/dashboard')) return '/dashboard';
    return '/dashboard'; // Default to dashboard/home
  };

  const [value, setValue] = React.useState(getCurrentPathValue());

  React.useEffect(() => {
    setValue(getCurrentPathValue());
  }, [location.pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    navigate(newValue); // newValue is the path
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflowY: 'auto', // Allow content to scroll
          // The actual page content will have its own padding/margins
        }}
      >
        {children} {/* Page content will be rendered here */}
      </Box>
      <Paper
        sx={{
          position: 'sticky', // Make it sticky at the bottom
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100, // Ensure it's above other content
          borderTop: '1px solid rgba(0, 0, 0, 0.12)' // Optional: add a top border
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
