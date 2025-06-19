import React, { useEffect } from 'react';
import {

  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  Button,
  Divider,
  useTheme,
  Box as MuiBox,
} from '@mui/material';
import { Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Box } from '@chakra-ui/react';
import { CloudUploadOutlined, CloudDownloadRounded, ArrowForwardIos } from '@mui/icons-material';
import Toolbar from '@mui/material/Toolbar';
import Lottie from "lottie-react";
import animationPassedData from "../assets/connecting.json";
import { useLocation, useNavigate } from "react-router-dom";
import { useSpeedometer } from '../hooks/useSpeedometer';
import { useProxy } from '../hooks/useProxy';
import { useServers } from '../hooks/useServers';
import thunderLogo from '../assets/rocket.png';


const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    connectionDetails,
    isConnecting,
    proxyError,
    clearProxyError,
    connectProxy,
    disconnectProxy,
    refreshConnectionDetails
  } = useProxy();
  const {
    selectedServer,
    fetchSelectedServer,
  } = useServers();
  const { speedInfo, isLoadingSpeed } = useSpeedometer();

  useEffect(() => {
    const shouldConnectOtherPage = location.state?.shouldConnect === 'true';
    if (shouldConnectOtherPage && selectedServer && connectionDetails && !connectionDetails.isConnected) {
      navigate(location.pathname, { replace: true, state: { ...location.state, shouldConnect: 'false' } });
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
    // No local UI state, just call the hook
    if (connectionDetails?.isConnected) {
      await disconnectProxy();
    } else if (selectedServer) {
      await connectProxy(selectedServer);
    }
    await refreshConnectionDetails();
  };

  const displayServerName = selectedServer?.city || selectedServer?.country || "Select a server";
  const displayServerUrl = selectedServer?.url || "No server selected";

  if (!connectionDetails) {
    return (
      <MuiBox height="100%" display="flex" alignItems="center" justifyContent="center" bgcolor={theme.palette.background.default}>
        <Card sx={{ p: 4, minWidth: 340, borderRadius: 3, boxShadow: 6, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading dashboard...</Typography>
        </Card>
      </MuiBox>
    );
  }

  return (
    <MuiBox
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Card sx={{
        minWidth: 300,
        maxWidth: 400,
        width: '100%',
        borderRadius: 4,
        boxShadow: 8,
        overflow: 'hidden',
        bgcolor: theme.palette.background.paper,
      }}>
        <Toolbar sx={{ px: 3, py: 2, bgcolor: theme.palette.background.paper }}>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 700, letterSpacing: 1 }}>
            Dashboard
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
            {isConnecting
              ? (connectionDetails.isConnected ? 'Disconnecting...' : 'Connecting...')
              : (connectionDetails.isConnected ? 'Connected' : 'Disconnected')}
          </Typography>


          <MuiBox sx={{ my: 2 }}>
            {isConnecting ? (
              <MuiBox sx={{ width: 120, height: 120 }}>
                <Lottie animationData={animationPassedData} loop={true} />
              </MuiBox>
            ) : (
              <Avatar
                alt={displayServerName}
                src={thunderLogo}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: connectionDetails.isConnected ? theme.palette.success.light : theme.palette.error.light,
                  border: `3px solid ${connectionDetails.isConnected ? theme.palette.success.main : theme.palette.error.main}`,
                  boxShadow: 3,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 8 },
                  padding: 2,
                  objectFit: 'contain',
                }}
                imgProps={{ style: { padding: 20, objectFit: 'contain' } }}
                onClick={handleConnectDisconnect}
              />
            )}
          </MuiBox>

          {/* IP Address */}
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            {connectionDetails.currentIp === "Error fetching IP" || connectionDetails.currentIp === ""
              ? <CircularProgress size={18} />
              : `Current IP: ${connectionDetails.currentIp}`}
          </Typography>

          {/* Speedometer */}
          <MuiBox
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%', // Match Button width
              bgcolor: theme.palette.action.hover,
              borderRadius: 2,
              p: 2,
              mb: 2,
              gap: 2,
              boxSizing: 'border-box',
              maxWidth: 400, // Match Card maxWidth
              minWidth: 300, // Match Card minWidth
            }}
          >
            <MuiBox sx={{ flex: 1, textAlign: 'center' }}>
              <MuiBox sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}>
                <CloudDownloadRounded sx={{ color: theme.palette.primary.main, fontSize: 28, mr: 1 }} />
                <Typography variant="caption" color="text.secondary">Download</Typography>
              </MuiBox>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {isLoadingSpeed
                  ? <CircularProgress size={16} />
                  : speedInfo
                    ? `${speedInfo.downloadSpeed} ${speedInfo.downloadUnit}`
                    : '0 B/s'}
              </Typography>
            </MuiBox>
            <Divider orientation="vertical" flexItem />
            <MuiBox sx={{ flex: 1, textAlign: 'center' }}>
              <MuiBox sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}>
                <CloudUploadOutlined sx={{ color: theme.palette.secondary.main, fontSize: 28, mr: 1 }} />
                <Typography variant="caption" color="text.secondary">Upload</Typography>
              </MuiBox>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {isLoadingSpeed
                  ? <CircularProgress size={16} />
                  : speedInfo
                    ? `${speedInfo.uploadSpeed} ${speedInfo.uploadUnit}`
                    : '0 B/s'}
              </Typography>
            </MuiBox>
          </MuiBox>
          {proxyError && (
            <Alert status="error" mt={4} variant="solid" style={{ width: '100%', marginTop: '16px', marginBottom: '16px' }}>
              <AlertIcon />
              <Box flex="1">
                <AlertTitle mr={2}>Proxy Connection Error!</AlertTitle>
                <AlertDescription>{proxyError}</AlertDescription>
              </Box>
              <CloseButton alignSelf="flex-start" position="relative" right={-1} top={-1} onClick={clearProxyError} />
            </Alert>
          )}

          {/* Server Card */}
          <Button
            variant="outlined"
            fullWidth
            sx={{
              mt: 1,
              borderRadius: 2,
              textTransform: 'none',
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
              justifyContent: 'space-between',
              gap: 2,
              width: '100%', // Match Speedometer width
              boxSizing: 'border-box',
              maxWidth: 400, // Match Card maxWidth
              minWidth: 300, // Match Card minWidth
            }}
            onClick={() => setTimeout(() => navigate("/home/serverList"))}
          >
            <MuiBox>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {displayServerName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {displayServerUrl}
              </Typography>
            </MuiBox>
            <ArrowForwardIos sx={{ fontSize: 18 }} />
          </Button>
        </CardContent>
      </Card>
    </MuiBox>
  );
};

export default DashboardPage;
