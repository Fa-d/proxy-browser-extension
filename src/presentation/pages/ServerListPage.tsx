import React from 'react'; // Added React import
import { Avatar, Sheet } from '@mui/joy';
import { Card, IconButton, List, ListItem, ListItemAvatar, ListItemText, CircularProgress, Box } from '@mui/material'; // Added CircularProgress, Box
// useNavigate is replaced by navigateTo
// import { useNavigate } from "react-router-dom";
import Toolbar from '@mui/material/Toolbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';

import { useServers } from '../hooks/useServers'; // Import the hook
import { navigateTo } from '../../infrastructure/navigation/RouterService'; // Import for navigation
import { Server } from '../../domain/models/Server'; // Import Server type

// Removed hardcoded produvtList, will come from useServers hook

export const ServerListPage: React.FC = () => { // Changed to React.FC
  // const navigate = useNavigate(); // Replaced
  const {
    servers,
    isLoadingServers,
    selectServer,
    serverError
  } = useServers();

  const handleServerSelect = async (server: Server) => {
    await selectServer(server);
    // Navigate back to dashboard, and pass state to trigger connection
    navigateTo("/dashboard", { state: { shouldConnect: 'true' } });
  };

  return (
    <main>
      <Sheet
        sx={{
          width: 300,
          mx: 'auto',
          my: 4,
          py: 3,
          px: 2,
          display: 'flex',
          minHeight: 300, // Keep minHeight
          maxHeight: 500, // Keep maxHeight
          flexDirection: 'column',
          gap: 2,
          borderRadius: 'sm',
          boxShadow: 'md',
          overflowY: 'auto' // Added for scrollability if list is long
        }}
        variant="outlined"
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => {
            navigateTo("/dashboard"); // Navigate back to dashboard
          }} aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Server List
          </Typography>
          {/* Added a placeholder for potential right-side action like a refresh button */}
          <Box sx={{ width: 40 }} />
        </Toolbar>

        {isLoadingServers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : serverError ? (
          <Typography color="error" sx={{ textAlign: 'center', mt: 2 }}>
            Error: {serverError}
          </Typography>
        ) : servers.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 2 }}>
            No servers available.
          </Typography>
        ) : (
          <List sx={{ overflowY: 'auto', flexGrow: 1 }}> {/* Ensure list itself can scroll if content overflows Sheet */}
            {servers.map((server) => ( // Changed product to server
              <Card
                key={server.id} // Use server.id as key
                sx={{ mt: 2, width: '100%', cursor: 'pointer' }}
                onClick={() => handleServerSelect(server)}
              >
                <ListItem>
                  <ListItemAvatar>
                    {/* Placeholder Avatar, can be customized */}
                    <Avatar sx={{ width: 50, height: 50 }} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={server.url}
                    secondary={`${server.city}, ${server.country}`} // Combined city and country
                  />
                </ListItem>
              </Card>
            ))}
          </List>
        )}
      </Sheet>
    </main>
  );
};

// Removed export default as it's a named export 'ServerListPage'
// If default is preferred, change export const ServerListPage ... to export default function ServerListPage ...
