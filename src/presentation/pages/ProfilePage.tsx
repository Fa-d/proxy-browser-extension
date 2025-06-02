// src/presentation/pages/ProfilePage.tsx
import React from 'react';
import { Box, Card, CardContent, Typography, Button, Divider, CircularProgress, Avatar } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import LogoutIcon from '@mui/icons-material/Logout'; // Standard MUI logout icon
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Standard MUI profile icon


const ProfilePage: React.FC = () => {
  const { currentUser, userDetails, logout, isLoading } = useAuth();

  if (isLoading || (!currentUser && !userDetails)) { // Show loader if auth state is still loading
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 56px)', p: 3 }}> {/* Adjust height for potential bottomNav */}
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) { // Should ideally not happen if routes are protected, but good fallback
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Not logged in</Typography>
        <Typography>Please log in to view your profile.</Typography>
        {/* Optionally, add a button to navigate to login, though Router should handle this */}
      </Box>
    );
  }

  // Fallback for fullName if userDetails is somehow null but currentUser exists
  const displayName = userDetails?.fullName || currentUser.email;
  const displayPackage = userDetails?.packageName || 'N/A';
  const displayValidity = userDetails?.validityDate || 'N/A';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start', // Align items to the top
        p: 2, // Padding around the card
        pt: 4, // More padding at the top
        minHeight: 'calc(100vh - 56px - 56px)', // Viewport height - top_bar_approx - bottom_nav_approx
        boxSizing: 'border-box',
      }}
    >
      <Card
        sx={{
          minWidth: 320,
          maxWidth: 450,
          width: '100%',
          borderRadius: 3,
          boxShadow: 6,
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Avatar sx={{ width: 80, height: 80, margin: '0 auto 16px', bgcolor: 'primary.main' }}>
            <AccountCircleIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
            {displayName}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: 'left', my: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Email:</strong> {currentUser.email}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Account ID:</strong> {currentUser.id}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Package:</strong> {displayPackage}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Expires on:</strong> {displayValidity}
            </Typography>
            {/* Add more details from userDetails if needed */}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Button
            variant="contained"
            color="primary" // Or "error" for logout
            startIcon={<LogoutIcon />}
            onClick={logout}
            fullWidth
            sx={{ mt: 2, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
