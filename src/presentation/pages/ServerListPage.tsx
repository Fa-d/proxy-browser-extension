import React, { useState } from 'react';
import { Avatar, Sheet } from '@mui/joy';
import {
  Card,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import { Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Box } from '@chakra-ui/react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useServers } from '../hooks/useServers';
import { useProxy } from '../hooks/useProxy';
import { Server } from '../../domain/models/Server';
import { useNavigate } from 'react-router-dom'
import { pingServer } from '../utils/pingServer';

export const ServerListPage: React.FC = () => {
  const {
    servers,
    isLoadingServers,
    selectServer,
    serverError,
  } = useServers();
  const { proxyError, clearProxyError } = useProxy();
  const navigate = useNavigate();
  const [pingError, setPingError] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const handleServerSelect = async (server: Server) => {
    setPingError(null);
    setIsPinging(true);
    const alive = await pingServer(server.url, "admin", "123456");
    setIsPinging(false);
    if (!alive) {
      setPingError('Selected server is not reachable. Please choose another server.');
      return;
    }
    await selectServer(server);
    navigate('/home/dashboard', { state: { shouldConnect: 'true' } });
  };

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
      <Sheet
        sx={{
          width: '100%',
          borderRadius: 4,
          boxShadow: 8,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
        }}
        variant="outlined"
      >
        <Toolbar
          sx={{
            height: 70,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            boxShadow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setTimeout(() => navigate('/home/dashboard'))}
            aria-label="back"
            sx={{
              position: 'absolute',
              left: 8,
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              letterSpacing: 1,
              textAlign: 'center',
            }}
          >
            Server List
          </Typography>
        </Toolbar>
        <Divider />
        <Box sx={{ px: 3, py: 2, flex: 1, minHeight: 350, maxHeight: 500, overflowY: 'auto' }}>

          {proxyError && (
            <Alert status="error" mt={2} mb={2} variant="solid">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle mr={2}>Proxy Connection Error!</AlertTitle>
                <AlertDescription>{proxyError}</AlertDescription>
              </Box>
              <CloseButton alignSelf="flex-start" position="relative" right={-1} top={-1} onClick={clearProxyError} />
            </Alert>
          )}


          {pingError && (
            <Box
              position="fixed"
              top="50%"
              left="50%"
              sx={{
                transform: 'translate(-50%, -50%)',
                zIndex: 1400,
                minWidth: 320,
                boxShadow: 6,
                borderRadius: 3,
                bgcolor: 'background.paper',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                paddingBlock: 30
              }}
            >
              <Alert
                status="error"
                variant="solid"
                sx={{
                  bgcolor: 'error.main',
                  color: 'common.white',
                  borderRadius: 12,
                  width: '80%',
                  boxShadow: '6',
                  p: 0,
                  alignItems: 'center',
                  background: 'linear-gradient(90deg, #ff1744 0%, #ff8a65 100%)',

                }}
              >
                <AlertIcon sx={{ height: 50, width: 50, marginInline: 30 }} />

                <Box flex="1">
                  <AlertTitle mr={2} sx={{ fontSize: 20, fontWeight: 700 }}>
                    Server Unreachable!
                  </AlertTitle>
                  <AlertDescription sx={{ fontSize: 16 }}>
                    {pingError}
                  </AlertDescription>
                </Box>
                <CloseButton alignSelf="flex-start" position="relative" right={-1} top={-1} onClick={() => setPingError(null)} />
              </Alert>
            </Box>
          )}
          {isLoadingServers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : serverError ? (
            <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
              Error: {serverError}
            </Typography>
          ) : servers.length === 0 ? (
            <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
              No servers available.
            </Typography>
          ) : (
            <List disablePadding>
              {servers.map((server) => (
                <Card
                  key={server.id}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: 'sm',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 'md',
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => handleServerSelect(server)}
                >
                  <ListItem
                    sx={{
                      py: 1.5,
                      px: 2,
                      alignItems: 'center',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                          fontWeight: 700,
                          fontSize: 22,
                        }}
                      >
                        {server.country?.[0] || 'S'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={600}>
                          {server.country}      {/* {server.city}, {server.country} */}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {server.url}
                        </Typography>
                      }
                    />
                  </ListItem>
                </Card>
              ))}
            </List>
          )}

          {isPinging && (
            <Box position="fixed"
              top="50%"

              sx={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2,
                background: 'background.paper',
              }}>
              <CircularProgress color="primary" size={32} thickness={5} />
              <Typography sx={{ ml: 2 }}>Checking server availability...</Typography>
            </Box>
          )}
        </Box>
      </Sheet>
    </Box>
  );
};
