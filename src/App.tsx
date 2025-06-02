// src/App.tsx
import React from 'react';
import { useAuth } from './presentation/hooks/useAuth';
import LoginPage from './presentation/pages/LoginPage';
import DashboardPage from './presentation/pages/DashboardPage';
import ServerListPage from './presentation/pages/ServerListPage';
import ProfilePage from './presentation/pages/ProfilePage'; // Added
import BottomNavLayout from './presentation/components/BottomNavLayout'; // Added
import { Box, CircularProgress } from '@mui/material';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { setNavigate } from './infrastructure/navigation/RouterService';
import { useNavigate } from 'react-router-dom';

// Component to initialize navigation service
const InitializeNavigation: React.FC = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;
};

// Main App component that decides what to render based on auth state
const AppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    // Show a full-page progress bar
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // After loading, decide which set of routes to show
  if (currentUser) {
    // User is logged in, show protected routes with BottomNavLayout
    return (
      <Routes>
        <Route element={<BottomNavLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/serverList" element={<ServerListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/*
            Default route for logged-in users.
            If user navigates to extension root ('/' in HashRouter, which is often the base path)
            and they are logged in, redirect to /dashboard.
          */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        {/*
          Fallback for any authenticated route not matching the layout routes.
          This ensures that if a user somehow lands on e.g. /unknown while logged in,
          they are redirected to a safe default like /dashboard.
        */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  } else {
    // User is not logged in, show public routes
    // The initial path for a non-logged-in user will be / due to the Navigate below
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* Redirect any other path to login if not logged in */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
};

// The main App wrapper that includes the Router
function App() {
  return (
    <HashRouter>
      <InitializeNavigation />
      <AppContent />
    </HashRouter>
  );
}

export default App;
