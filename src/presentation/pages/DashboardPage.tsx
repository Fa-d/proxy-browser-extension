import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  // IconButton, // Removed as it's not used
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import { CloudUploadOutlined, CloudDownloadRounded, ArrowForwardIos } from '@mui/icons-material'; // Removed Logout as LogoutIcon
import Toolbar from '@mui/material/Toolbar';
import Lottie from "lottie-react";
import animationPassedData from "../assets/connecting.json";
import { useLocation } from "react-router-dom";
import { useSpeedometer } from '../hooks/useSpeedometer';
import { useProxy } from '../hooks/useProxy';
import { useServers } from '../hooks/useServers';
import { navigateTo } from '../../infrastructure/navigation/RouterService';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
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
  } = useServers();
  const { speedInfo, isLoading: isLoadingSpeed } = useSpeedometer();

  const [isProcessingProxyAction, setIsProcessingProxyAction] = useState(false);

  useEffect(() => {
    const shouldConnectOtherPage = location.state?.shouldConnect === 'true';
    if (shouldConnectOtherPage && selectedServer && connectionDetails && !connectionDetails.isConnected) {
      navigateTo(location.pathname, { replace: true, state: { ...location.state, shouldConnect: 'false' } });
      handleConnectDisconnect();
    }
  }, [location.state, selectedServer, connectionDetails, location.pathname]);

  useEffect(() => {
    fetchSelectedServer();
  }, [fetchSelectedServer]);

  const handleConnectDisconnect = async () => {
    if (!selectedServer && !connectionDetails?.isConnected) {
      alert("Please select a server from the server list first."); 
      return;
    }
    setIsProcessingProxyAction(true);
    if (connectionDetails?.isConnected) {
      await disconnectProxy();
    } else if (selectedServer) {
      await connectProxy(selectedServer);
    }
    await refreshConnectionDetails();
    setTimeout(() => setIsProcessingProxyAction(false), 1200); 
  };

  const defaultImageUrl = "/thunder.svg";
  const displayServerName = selectedServer?.city || selectedServer?.country || "Select a server";
  const displayServerUrl = selectedServer?.url || "No server selected";

  if (!connectionDetails) {
    return (
      <Box height="100%" display="flex" alignItems="center" justifyContent="center" bgcolor={theme.palette.background.default}>
        <Card sx={{ p: 4, minWidth: 340, borderRadius: 3, boxShadow: 6, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center', 
        width: '100%', 
        flexGrow: 1,
        p: 2, 
        boxSizing: 'border-box',
      }}
    >
      <Card sx={{
        minWidth: 350,
        maxWidth: 400,
        width: '100%',
        borderRadius: 4,
        boxShadow: 8,
        p: 0,
        overflow: 'hidden',
        bgcolor: theme.palette.background.paper,
      }}>
        <Toolbar sx={{ px: 3, py: 2, bgcolor: theme.palette.background.paper }}>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1 }}>
            Dashboard 1
          </Typography>
        </Toolbar>
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 4, py: 3 }}>

          <Typography
            variant="subtitle1"
            sx={{
              color: connectionDetails.isConnected ? theme.palette.success.main : theme.palette.error.main,
              fontWeight: 600,
              mb: 1,
              letterSpacing: 1,
            }}
          >
            {isProcessingProxyAction
              ? (connectionDetails.isConnected ? 'Disconnecting...' : 'Connecting...')
              : (connectionDetails.isConnected ? 'Connected' : 'Disconnected')}
          </Typography>

          {/* Avatar or Lottie */}
          <Box sx={{ my: 2 }}>
            {isProcessingProxyAction || isConnecting ? (
              <Box sx={{ width: 120, height: 120 }}>
                <Lottie animationData={animationPassedData} loop={true} />
              </Box>
            ) : (
              <Avatar
                src={defaultImageUrl}
                alt={displayServerName}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: connectionDetails.isConnected ? theme.palette.success.light : theme.palette.error.light,
                  border: `3px solid ${connectionDetails.isConnected ? theme.palette.success.main : theme.palette.error.main}`,
                  boxShadow: 3,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 8 },
                }}
                onClick={handleConnectDisconnect}
              />
            )}
          </Box>

          {/* IP Address */}
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            {connectionDetails.currentIp === "Error fetching IP" || connectionDetails.currentIp === ""
              ? <CircularProgress size={18} />
              : `Current IP: ${connectionDetails.currentIp}`}
          </Typography>

          {/* Speedometer */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              bgcolor: theme.palette.action.hover,
              borderRadius: 2,
              p: 2,
              mb: 2,
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}>
                <CloudDownloadRounded sx={{ color: theme.palette.primary.main, fontSize: 28, mr: 1 }} />
                <Typography variant="caption" color="text.secondary">Download</Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {isLoadingSpeed
                  ? <CircularProgress size={16} />
                  : speedInfo
                    ? `${speedInfo.downloadSpeed} ${speedInfo.downloadUnit}`
                    : '0 B/s'}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}>
                <CloudUploadOutlined sx={{ color: theme.palette.secondary.main, fontSize: 28, mr: 1 }} />
                <Typography variant="caption" color="text.secondary">Upload</Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {isLoadingSpeed
                  ? <CircularProgress size={16} />
                  : speedInfo
                    ? `${speedInfo.uploadSpeed} ${speedInfo.uploadUnit}`
                    : '0 B/s'}
              </Typography>
            </Box>
          </Box>

          {/* Error Message */}
          {proxyError && (
            <Typography color="error" sx={{ mb: 1, fontSize: 14 }}>
              Error: {proxyError}
            </Typography>
          )}

          {/* Server Card */}
          <Button
            variant="outlined"
            fullWidth
            sx={{
              mt: 1,
              borderRadius: 2,
              textTransform: 'none',
              justifyContent: 'flex-start',
              px: 2,
              py: 1.5,
              fontWeight: 500,
              fontSize: 16,
              bgcolor: theme.palette.action.selected,
              color: theme.palette.text.primary,
              boxShadow: 0,
              '&:hover': { bgcolor: theme.palette.action.hover },
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
            onClick={() => navigateTo("/serverList")}
            endIcon={<ArrowForwardIos sx={{ fontSize: 18 }} />}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {displayServerName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {displayServerUrl}
              </Typography>
            </Box>
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
