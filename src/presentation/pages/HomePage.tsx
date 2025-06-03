import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import BottomNavLayout from '../components/BottomNavLayout';

const BOTTOM_NAVIGATION_HEIGHT = '56px';
const HomePage: React.FC = () => {
  return (
    <Box sx={{
      display: 'flex', 
      flexDirection: 'column',
       height: '100vh',
      width: '100vw',
    }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: 2,
          paddingBottom: `calc(${BOTTOM_NAVIGATION_HEIGHT} + 16px)`,
        }}
      >
        <Outlet />
      </Box>
      <BottomNavLayout />
    </Box>
  );
};

export default HomePage;