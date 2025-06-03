import React, { useEffect } from 'react';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home'; // Represents Dashboard
import StorageIcon from '@mui/icons-material/Storage'; // Represents ServerList
import PersonIcon from '@mui/icons-material/Person';   // Represents Profile
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determines the active tab based on the current path.
  // Expects paths like '/home/dashboard', '/home/serverlist', '/home/profile'
  const getCurrentPathSegment = React.useCallback(() => {
    const pathname = location.pathname; // e.g., /home/dashboard
    if (pathname.includes('/profile')) return 'profile';
    if (pathname.includes('/serverlist')) return 'serverlist';
    // Default to 'dashboard' for '/home/dashboard' or just '/home' or unrecognized paths
    return 'dashboard';
  }, [location.pathname]);

  const [value, setValue] = React.useState<string>(getCurrentPathSegment());

  useEffect(() => {
    setValue(getCurrentPathSegment());
  }, [getCurrentPathSegment, location.pathname]); // Re-evaluate when path changes

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue); // Update local state for immediate UI feedback
    // Navigate to the corresponding route under /home/
    // e.g., if newValue is 'dashboard', navigates to '/home/dashboard'
    navigate(`/home/${newValue}`);
  };

  return (
    <Paper
      sx={{
        position: 'fixed', // Fixed position at the bottom
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1, // Ensure it's above most other content
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
      >
        <BottomNavigationAction
          label="Dashboard" // "Home" typically implies the main dashboard screen
          value="dashboard" // This value will be used in handleChange to navigate
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          label="Servers"
          value="serverlist"
          icon={<StorageIcon />}
        />
        <BottomNavigationAction
          label="Profile"
          value="profile"
          icon={<PersonIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNavLayout;