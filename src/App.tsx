// src/App.tsx
import React from 'react';
import { useAuth } from './presentation/hooks/useAuth';
import LoginPage from './presentation/pages/LoginPage';
import DashboardPage from './presentation/pages/DashboardPage';
import { ServerListPage } from './presentation/pages/ServerListPage';
import ProfilePage from './presentation/pages/ProfilePage';
import BottomNavLayout from './presentation/components/BottomNavLayout';
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

  return (
    <Routes>
      {!currentUser ? (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route element={<BottomNavLayout><Outlet /></BottomNavLayout>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/serverList" element={<ServerListPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
};

function App() {
  return (
    <HashRouter>
      <InitializeNavigation />
      <AppContent />
    </HashRouter>
  );
}

export default App;
