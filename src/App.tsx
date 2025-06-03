// src/App.tsx
import React, { useEffect } from 'react';
import { useAuth } from './presentation/hooks/useAuth';
import LoginPage from './presentation/pages/LoginPage';
import DashboardPage from './presentation/pages/DashboardPage';
import { ServerListPage } from './presentation/pages/ServerListPage';
import ProfilePage from './presentation/pages/ProfilePage';
import HomePage from './presentation/pages/HomePage';
import { Box, CircularProgress } from '@mui/material';
import { HashRouter, Routes, Route, Navigate, Outlet, NavigateFunction } from 'react-router-dom';
import { setNavigate } from './infrastructure/navigation/RouterService';
import { useNavigate } from 'react-router-dom';


const InitializeNavigation: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;
};

const AppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
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
return (
    <Routes>
      {/* Route for the login page */}
      <Route
        path="/login"
        element={
          // If user is already logged in and tries to access /login, redirect to dashboard
          currentUser ? <Navigate to="/home/dashboard" replace /> : <LoginPage />
        }
      />

      {/* Protected routes under /home. HomePage acts as the layout. */}
      <Route
        path="/home"
        element={
          currentUser ? <HomePage /> : <Navigate to="/login" replace />
        }
      >
        {/* Nested routes within HomePage. Paths are relative to /home. */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="serverlist" element={<ServerListPage />} />
        <Route path="profile" element={<ProfilePage />} />
        {/* Default child route for /home: navigates to /home/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Root path redirection:
          - If logged in, go to the main dashboard.
          - If not logged in, go to the login page.
      */}
      <Route
        path="/"
        element={
          currentUser ? (
            <Navigate to="/home/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback for any unmatched routes */}
      <Route
        path="*"
        element={
          currentUser ? (
            <Navigate to="/home/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
  // return (
  //   <Routes>
  //     <Route
  //       path="/"
  //       element={<LoginPage />}
  //     />
  //     <Route
  //       element={
  //         currentUser ? <Outlet /> : <Navigate to="/" replace />
  //       }>
  //       <Route
  //         path="/dashboard"
  //         element={
  //           <HomePage />
  //         }
  //       >
  //         <Route path="dashboard" element={<DashboardPage />} />
  //         <Route path="serverList" element={<ServerListPage />} />
  //         <Route path="profile" element={<ProfilePage />} />

  //       </Route>
  //     </Route>
  //   </Routes>
  // );
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
