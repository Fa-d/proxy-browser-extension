// src/App.tsx
import React from 'react';
import { useAuth } from './presentation/hooks/useAuth';
import LoginPage from './presentation/pages/LoginPage';
import DashboardPage from './presentation/pages/DashboardPage';
import {ServerListPage} from './presentation/pages/ServerListPage';
import ProfilePage from './presentation/pages/ProfilePage'; // Added
import BottomNavLayout from './presentation/components/BottomNavLayout'; // Added
import { Box, CircularProgress } from '@mui/material';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { setNavigate } from './infrastructure/navigation/RouterService';
import { useNavigate } from 'react-router-dom';

// Component to initialize the RouterService's navigate function.
// This allows non-component parts of the app to trigger navigation.
const InitializeNavigation: React.FC = () => {
  const navigate = useNavigate(); // Hook from react-router-dom
  React.useEffect(() => {
    setNavigate(navigate); // Set the navigate function in our RouterService
  }, [navigate]);
  return null; // This component does not render anything itself
};

// AppContent manages the main routing logic based on authentication state.
const AppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    // Display a full-screen loading indicator while checking auth status.
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh', 
          width: '100vw',
          bgcolor: 'background.default' // Use theme background color
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // User is authenticated, render protected routes with BottomNavLayout.
  if (currentUser) {
    return (
      <Routes>
        {/* Routes that use BottomNavLayout */}
        <Route element={<BottomNavLayout><Outlet></Outlet></BottomNavLayout>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/serverList" element={<ServerListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Default route for logged-in users at root path: redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        {/* Fallback for any other authenticated paths not matching above: redirect to dashboard. */}
        {/* This handles cases like direct navigation to an undefined authenticated route. */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  } 
  
  // User is not authenticated, render public routes.
  else {
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* Fallback for any other unauthenticated paths: redirect to login page. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
};

// Main App component sets up the router and global components like InitializeNavigation.
function App() {
  return (
    <HashRouter>
      <InitializeNavigation />
      <AppContent /> 
    </HashRouter>
  );
}

export default App;
