import React, { useEffect } from 'react';
import { useAuth } from './presentation/hooks/useAuth';
import LoginPage from './presentation/pages/LoginPage';
import DashboardPage from './presentation/pages/DashboardPage';
import { ServerListPage } from './presentation/pages/ServerListPage';
import ProfilePage from './presentation/pages/ProfilePage';
import HomePage from './presentation/pages/HomePage';
import { Box, Card, CircularProgress, Typography, useTheme } from '@mui/material';
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './presentation/contexts/AuthContext';
import { useProxy } from './presentation/hooks/useProxy';


const AppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuthContext();
  const { connectionDetails } = useProxy();
  const theme = useTheme();
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


  if (!connectionDetails) {
    return (
      <Box height="100%" display="flex" alignItems="center" justifyContent="center" bgcolor={theme.palette.background.default}>
        <Card sx={{ p: 4, minWidth: 340, borderRadius: 3, boxShadow: 6, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Opening your app...</Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Routes>

      <Route
        path="/login"
        element={
          currentUser ? <Navigate to="/home/dashboard" replace /> : <LoginPage />
        }
      />

      <Route
        path="/home"
        element={
          currentUser ? <HomePage /> : <Navigate to="/login" replace />
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="serverlist" element={<ServerListPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

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

      {/* <Route
        path="*"
        element={
          currentUser ? (
            <Navigate to="/home/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      /> */}
    </Routes>
  );

};

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
