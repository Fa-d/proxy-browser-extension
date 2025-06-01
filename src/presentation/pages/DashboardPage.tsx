import React, { useEffect, useState } from 'react'; // Added useState
import Sheet from '@mui/joy/Sheet';
// useNavigate is not used directly, navigation handled by hooks or RouterService
// useLocation is used to get state for shouldConnect
import { useLocation } from "react-router-dom";
import { Box, Card, CardContent, Typography, Avatar, CircularProgress, IconButton } from '@mui/material'; // List, ListItem etc. seem unused here, consider removing if not needed
// import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // This was for a back button, but Logout is used
import Toolbar from '@mui/material/Toolbar';
import { Logout as LogoutIcon } from '@mui/icons-material'; // Renamed for clarity
import Lottie from "lottie-react";
// Adjusted path for assets
import animationPassedData from "../assets/connecting.json";
// CloudUploadOutlined, CloudDownloadRounded icons seem unused, consider removing
// import { CloudUploadOutlined, CloudDownloadRounded } from '@mui/icons-material';

import { useAuth } from '../hooks/useAuth';
import { useProxy } from '../hooks/useProxy';
import { useServers } from '../hooks/useServers';
import { navigateTo } from '../../infrastructure/navigation/RouterService'; // For navigation

// Interface DashboardProps is removed as props are now derived from hooks or not needed.
// lState, imageUrl, serverName are no longer passed as props.

const DashboardPage: React.FC = () => {
  // const navigate = useNavigate() // Replaced by navigateTo or hook actions
  const location = useLocation();
  const { logout } = useAuth(); // Assuming currentUser might be used for display later if needed
  const {
    connectionDetails,
    isConnecting,
    proxyError,
    connectProxy,
    disconnectProxy,
    refreshConnectionDetails
  } = useProxy();
  const {
    selectedServer,
    fetchSelectedServer,
    // serverError: useServersError // Potential error from useServers hook
  } = useServers();

  // This state is to manage the visual "connecting..." / "disconnecting..." state for the Lottie animation
  const [isProcessingProxyAction, setIsProcessingProxyAction] = useState(false);

  // Previous direct chrome API calls and IP fetching are now handled by useProxy.
  // React.useEffect(() => { setConnectedState() }, []);
  // function setConnectedState() { ... }
  // React.useEffect(() => { setInterval(async () => { ... }) }, []);

  // Handle the shouldConnect logic from navigation state
  useEffect(() => {
    const shouldConnectOtherPage = location.state?.shouldConnect === 'true';
    if (shouldConnectOtherPage && selectedServer && connectionDetails && !connectionDetails.isConnected) {
      // Clear the state to prevent re-triggering if the user navigates away and back
      // or if the component re-renders for other reasons.
      navigateTo(location.pathname, { replace: true, state: { ...location.state, shouldConnect: 'false' } });
      handleConnectDisconnect();
    }
  }, [location.state, selectedServer, connectionDetails, navigateTo, location.pathname]);

  // Fetch selected server initially
  useEffect(() => {
    fetchSelectedServer();
  }, [fetchSelectedServer]);

  const handleConnectDisconnect = async () => {
    if (!selectedServer && !connectionDetails?.isConnected) {
      // TODO: Show error to user - "Please select a server first"
      // This could be a notification or a message on the UI
      console.error("DashboardPage: No server selected to connect.");
      alert("Please select a server from the server list first.");
      return;
    }

    setIsProcessingProxyAction(true); // Show Lottie animation
    if (connectionDetails?.isConnected) {
      await disconnectProxy();
    } else if (selectedServer) { // Only connect if a server is selected
      await connectProxy(selectedServer);
    }
    // After action, refresh details (though hooks might do this already)
    await refreshConnectionDetails();
    // Hide Lottie animation after a delay to allow users to see it
    setTimeout(() => setIsProcessingProxyAction(false), 1500); // Adjust delay as needed
  };

  const handleLogout = () => {
    logout(); // Navigates to '/' via useAuth hook
  };

  // Default image URL, can be made dynamic if needed
  const defaultImageUrl = "/vite.svg"; // Using vite.svg as a placeholder, original logo.png might need path adjustment
                                        // The original path was an absolute local path, which is not portable.
                                        // "/Users/kolpolok/webpro/proxy-browser-extension/src/assets/logo.png"
                                        // Assuming logo.png is now in src/presentation/assets/logo.png
                                        // If so, it would be "assets/logo.png" relative to public/index.html or handled by Vite build.
                                        // For now, let's use a known public asset like vite.svg or ensure logo.png is correctly placed and referenced.
                                        // For a cleaner solution, import the image: import logoUrl from '../assets/logo.png';

  const displayServerName = selectedServer?.city || selectedServer?.country || "Select a server";
  const displayServerUrl = selectedServer?.url || "No server selected";

  // Show loading indicator if connectionDetails are not yet available (initial load)
  if (!connectionDetails) {
    return (
        <Sheet sx={{ width: 300, mx: 'auto', my: 4, py: 3, px: 2, display: 'flex', minHeight: 400, flexDirection: 'column', gap: 2, borderRadius: 'sm', boxShadow: 'md', alignItems: 'center', justifyContent: 'center' }} variant='outlined'>
            <CircularProgress />
            <Typography>Loading dashboard...</Typography>
        </Sheet>
    );
  }

  return (
    <Sheet
      sx={{
        width: 300,
        mx: 'auto',
        my: 4,
        py: 3,
        px: 2,
        display: 'flex',
        minHeight: 400,
        flexDirection: 'column',
        gap: 2,
        borderRadius: 'sm',
        boxShadow: 'md',
      }}
      variant="outlined"
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Dashboard
        </Typography>
        <IconButton onClick={handleLogout} aria-label="logout">
            <LogoutIcon />
        </IconButton>
      </Toolbar>

      <Typography variant="h5" sx={{ alignSelf: 'center', color: connectionDetails.isConnected ? '#6897BB' : '#d9534f' }}>
        {isProcessingProxyAction ? (connectionDetails.isConnected ? 'Disconnecting...' : 'Connecting...') : (connectionDetails.isConnected ? 'Connected' : 'Disconnected')}
      </Typography>

      {isProcessingProxyAction || isConnecting ? ( // Show Lottie if processing or if hook reports connecting
        <Box sx={{ width: 200, height: 200, alignSelf: 'center' }}>
          <Lottie animationData={animationPassedData} loop={true} />
        </Box>
      ) : (
        <Avatar
          // src={selectedServer?.imageUrl || defaultImageUrl} // Assuming Server model might have an imageUrl
          src={defaultImageUrl} // Using default for now
          alt={displayServerName}
          sx={{
            mt: 3,
            width: 150,
            height: 150,
            alignSelf: 'center',
            backgroundColor: connectionDetails.isConnected ? '#6897BB' : '#d9534f',
            cursor: 'pointer'
          }}
          onClick={handleConnectDisconnect}
        />
      )}

      <Typography sx={{ mt: 3, alignSelf: 'center' }}>
        {connectionDetails.currentIp === "Error fetching IP" || connectionDetails.currentIp === "" ?
            (<CircularProgress size={20} />) :
            (`Current IP: ${connectionDetails.currentIp}`)}
      </Typography>

      {proxyError && (
        <Typography color="error" sx={{ alignSelf: 'center' }}>
          Error: {proxyError}
        </Typography>
      )}

      {/* {useServersError && ( // Example of showing error from another hook
        <Typography color="error" sx={{ alignSelf: 'center' }}>
          Server Error: {useServersError}
        </Typography>
      )} */}

      <Card sx={{ mt: 'auto', width: '100%', minHeight: 90, cursor: 'pointer' }} onClick={() => {
        navigateTo("/serverList");
      }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h5" component="div">
              {displayServerName}
            </Typography>
            {/* Potentially add an icon here like > */}
          </Box>
          <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
            {displayServerUrl}
          </Typography>
        </CardContent>
      </Card>
    </Sheet>
  );
};

// Removed showSpeed and connectDisconnectDecisionBattle functions as their logic is now within hooks or component.

export default DashboardPage;
