import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  useTheme,
  Box as MuiBox,
} from '@mui/material';
import { Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Box } from '@chakra-ui/react';
import { ArrowForwardIos } from '@mui/icons-material';
import { useLocation, useNavigate } from "react-router-dom";
//import { useSpeedometer } from '../hooks/useSpeedometer';
import { useProxy } from '../hooks/useProxy';
import { useServers } from '../hooks/useServers';
import titleLogo from '../assets/title_logo.png';
import connectedImg from '../assets/connected.png';
import connectingImg from '../assets/connecting.png';
import disconnectedImg from '../assets/disconnected.png';


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
  //const { speedInfo, isLoadingSpeed } = useSpeedometer();
  const [actionInProgress, setActionInProgress] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<null | 'connect' | 'disconnect'>(null);
  const expectedConnectionState = React.useRef<null | boolean>(null);
  const autoDisconnectTimer = React.useRef<NodeJS.Timeout | null>(null);

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

  // Effect to clear pendingAction only when the expected state is reached
  useEffect(() => {
    if (pendingAction === 'connect' && connectionDetails?.isConnected) {
      setPendingAction(null);
      expectedConnectionState.current = null;
    } else if (pendingAction === 'disconnect' && !connectionDetails?.isConnected) {
      setPendingAction(null);
      expectedConnectionState.current = null;
    }
  }, [connectionDetails?.isConnected, pendingAction]);

  // Auto-disconnect effect: if connected but IP stays loading for >5s, disconnect
  useEffect(() => {
    const ipIsLoading = connectionDetails?.isConnected && (!connectionDetails.currentIp || connectionDetails.currentIp === '' || connectionDetails.currentIp === 'Error fetching IP');
    if (ipIsLoading) {
      if (!autoDisconnectTimer.current) {
        autoDisconnectTimer.current = setTimeout(async () => {
          await disconnectProxy();
          await refreshConnectionDetails();
        }, 5000); // 5 seconds
      }
    } else {
      if (autoDisconnectTimer.current) {
        clearTimeout(autoDisconnectTimer.current);
        autoDisconnectTimer.current = null;
      }
    }
    return () => {
      if (autoDisconnectTimer.current) {
        clearTimeout(autoDisconnectTimer.current);
        autoDisconnectTimer.current = null;
      }
    };
  }, [connectionDetails?.isConnected, connectionDetails?.currentIp, disconnectProxy, refreshConnectionDetails]);

  const handleConnectDisconnect = async () => {
    if (actionInProgress) return; // Prevent double actions
    setActionInProgress(true);
    try {
      if (!selectedServer && !connectionDetails?.isConnected) {
        alert("Please select a server from the server list first.");
        return;
      }
      if (connectionDetails?.isConnected) {
        setPendingAction('disconnect');
        expectedConnectionState.current = false;
        await disconnectProxy();
        await refreshConnectionDetails();
      } else if (selectedServer) {
        setPendingAction('connect');
        expectedConnectionState.current = true;
        await connectProxy(selectedServer);
        await refreshConnectionDetails();
      }
    } finally {
      setActionInProgress(false);
    }
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

        <MuiBox sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          <img src={titleLogo} alt="Logo" style={{ width: 148, height: 48, objectFit: 'contain', marginLeft: 12, marginTop: 12 }} />
        </MuiBox>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 4, py: 3, pt: 1 }}>

          <Typography
            variant="subtitle1"
            sx={{
              color: isConnecting || pendingAction
                ? (pendingAction === 'disconnect' ? theme.palette.success.main : theme.palette.error.main)
                : (connectionDetails.isConnected ? theme.palette.success.main : theme.palette.error.main),
              fontWeight: 600,
              mb: 1,
              letterSpacing: 1,
            }}
          >
            {(isConnecting || pendingAction)
              ? (pendingAction === 'disconnect'
                ? <span style={{ color: theme.palette.error.main }}>Disconnecting...</span>
                : <span style={{ color: theme.palette.success.main }}>Connecting...</span>)
              : (connectionDetails.isConnected ? 'Connected' : 'Disconnected')}
          </Typography>


          <MuiBox >
            {isConnecting || actionInProgress ? (
              <MuiBox sx={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={connectingImg} alt="Connecting" style={{ width: 180, height: 180, objectFit: 'contain', paddingBlock: 4 }} />
              </MuiBox>
            ) : connectionDetails.isConnected ? (
              <MuiBox sx={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={connectedImg} alt="Connected" style={{ width: 180, height: 180, objectFit: 'contain', paddingBlock: 4, cursor: actionInProgress ? 'not-allowed' : 'pointer', opacity: actionInProgress ? 0.5 : 1 }} onClick={handleConnectDisconnect} />
              </MuiBox>
            ) : (
              <MuiBox sx={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={disconnectedImg} alt="Disconnected" style={{ width: 180, height: 180, objectFit: 'contain', paddingBlock: 4, cursor: actionInProgress ? 'not-allowed' : 'pointer', opacity: actionInProgress ? 0.5 : 1 }} onClick={handleConnectDisconnect} />
              </MuiBox>
            )}
          </MuiBox>

          {/* IP Address */}
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
            {connectionDetails.currentIp === "Error fetching IP" || connectionDetails.currentIp === ""
              ? <CircularProgress size={18} />
              : `Current IP: ${connectionDetails.currentIp}`}
          </Typography>

          {/* Speedometer */}
          {/* <MuiBox
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
          </MuiBox> */}

          <MuiBox sx={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            borderRadius: 2,
            mb: 4,
            bgcolor: connectionDetails.isConnected ? '#C9EFE6' : '#F2C8C8',
            textAlign: 'center',
          }}>
            <Typography variant="subtitle2" sx={{ py: 1, fontWeight: 600, color: connectionDetails.isConnected ? '#116447B2' : '#B41313B2' }}>
              Security status: {connectionDetails.isConnected ? 'Safe' : 'Unsafe'}
            </Typography>
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
