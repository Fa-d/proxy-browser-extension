import React, { useEffect } from 'react';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import StorageIcon from '@mui/icons-material/Storage';
import PersonIcon from '@mui/icons-material/Person';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();


  const getCurrentPathSegment = React.useCallback(() => {
    const pathname = location.pathname;
    if (pathname.includes('/profile')) return 'profile';
    if (pathname.includes('/serverlist')) return 'serverlist';
    return 'dashboard';
  }, [location.pathname]);

  const [value, setValue] = React.useState<string>(getCurrentPathSegment());

  useEffect(() => {
    setValue(getCurrentPathSegment());
  }, [getCurrentPathSegment, location.pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    navigate(`/home/${newValue}`);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
        sx={{
          '& .Mui-selected, & .Mui-selected svg': {
            color: '#7149DD',
          },
        }}
      >
        <BottomNavigationAction
          label="Dashboard"
          value="dashboard"
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