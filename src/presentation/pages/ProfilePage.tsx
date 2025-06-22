import React from 'react';
import { Box, Card, CardContent, Typography, Button, Divider, CircularProgress, Avatar } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import LogoutIcon from '@mui/icons-material/Logout'; // Standard MUI logout icon
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Standard MUI profile icon
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext';
import { useServers } from '../hooks/useServers';
import { useProxy } from '../hooks/useProxy';


const ProfilePage: React.FC = () => {
  const { currentUser, userDetails, logout, isLoading } = useAuthContext();
  const { connectionDetails, disconnectProxy } = useProxy();
  const { selectServer } = useServers();
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 112px)', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">User not found</Typography>
        <Typography>Please try logging in again.</Typography>
      </Box>
    );

  }

  const displayName = userDetails?.fullName || currentUser.email;
  const displayPackage = userDetails?.packageName || 'N/A';
  const displayValidity = userDetails?.validityDate || 'N/A';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Card
        sx={{
          minWidth: 300,
          maxWidth: 480,
          width: '100%',
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: { xs: 3, sm: 6 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, margin: '0 auto 16px', bgcolor: 'primary.main' }}>
            <AccountCircleIcon sx={{ fontSize: 60,}} />
          </Avatar>
          <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
            {displayName}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: 'left', my: 2, px: { xs: 1, sm: 0 } }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Email:</strong> {currentUser.email}
            </Typography>
            {/* <Typography variant="subtitle1" gutterBottom>
              <strong>Account ID:</strong> {currentUser.id}
            </Typography> */}
            <Typography variant="subtitle1" gutterBottom>
              <strong>Package:</strong> {displayPackage}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Expires on:</strong> {displayValidity}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={async () => {
              if (connectionDetails?.isConnected) {
                await disconnectProxy();
              }
              await selectServer(null);
              await logout();
            }}
            fullWidth
            sx={{ mt: 2, py: 1.5, borderRadius: 2, fontWeight: 'bold', background: '#7149DD', color: '#fff', '&:hover': { background: '#5a36b6' } }}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Box >
  );
};
export default ProfilePage;

