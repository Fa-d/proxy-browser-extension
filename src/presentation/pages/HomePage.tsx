import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import BottomNavLayout from '../components/BottomNavLayout';

const BOTTOM_NAVIGATION_HEIGHT = '56px';
const CONTENT_WIDTH = 340;
const HomePage: React.FC = () => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: CONTENT_WIDTH,
    
      alignItems: 'center', // Center horizontally
      justifyContent: 'center', // Center vertically if needed
    }}>
      <Box
        component="main"
        sx={{
          paddingBottom: `calc(${BOTTOM_NAVIGATION_HEIGHT} + 16px)`,
          width: CONTENT_WIDTH,
          maxWidth: '100vw',

        }}
      >
        <Outlet />
      </Box>
      <BottomNavLayout />
    </Box>
  );
};

export default HomePage;