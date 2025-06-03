import React from 'react';
import { Avatar, Sheet } from '@mui/joy';
import {
  Card,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Box,
  Toolbar,
  Typography,
  Divider,
  // Tooltip, // Removed as Refresh button is commented out
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import RefreshIcon from '@mui/icons-material/Refresh'; // Removed as Refresh button is commented out

import { useServers } from '../hooks/useServers';
import { navigateTo } from '../../infrastructure/navigation/RouterService';
import { Server } from '../../domain/models/Server';

export const ServerListPage: React.FC = () => {
  const {
    servers,
    isLoadingServers,
    selectServer,
    serverError,
  } = useServers();

  const handleServerSelect = async (server: Server) => {
    await selectServer(server);
    navigateTo('/dashboard', { state: { shouldConnect: 'true' } });
  };

  return (
    <Box
      sx={{
        height: '100%', // Changed from minHeight: '100vh'
        // bgcolor: 'background.default', // Removed, assuming BottomNavLayout or App.tsx handles it
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Sheet
        sx={{
          width: 370,
          mx: 'auto',
          py: 0,
          px: 0,
          borderRadius: 3,
          boxShadow: 'lg',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
        }}
        variant="outlined"
      >
        <Toolbar
          sx={{
            minHeight: 56,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            boxShadow: 1,
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigateTo('/dashboard')}
            aria-label="back"
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              textAlign: 'center',
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            Server List
          </Typography>
        </Toolbar>
        <Divider />
        <Box sx={{ px: 3, py: 2, flex: 1, minHeight: 350, maxHeight: 500, overflowY: 'auto' }}>
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
                          {server.city}, {server.country}
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
        </Box>
      </Sheet>
    </Box>
  );
};
