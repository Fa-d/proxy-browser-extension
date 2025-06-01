import { useState, useEffect, useCallback } from 'react';
import { Server } from '../../domain/models/Server';
import { ServerService } from '../../application/services/ServerService';

const serverService = new ServerService();

export const useServers = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const srvs = await serverService.executeGetServers();
      setServers(srvs);
    } catch (err: any) {
      console.error("useServers - fetchServers error:", err);
      setError(err.message || 'Failed to fetch servers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSelectedServer = useCallback(async () => {
    // No separate loading state for this, often called with other actions
    setError(null);
    try {
      const srv = await serverService.executeGetSelectedServer();
      setSelectedServer(srv);
    } catch (err: any) {
      console.error("useServers - fetchSelectedServer error:", err);
      setError(err.message || 'Failed to fetch selected server');
    }
  }, []);

  const selectServer = useCallback(async (server: Server) => {
    // No separate loading state for this, typically a quick operation
    setError(null);
    try {
      await serverService.executeSelectServer(server);
      setSelectedServer(server); // Optimistically update or re-fetch
    } catch (err: any) {
      console.error("useServers - selectServer error:", err);
      setError(err.message || 'Failed to select server');
    }
  }, []);

  useEffect(() => {
    fetchServers();
    fetchSelectedServer();
  }, [fetchServers, fetchSelectedServer]);

  return {
    servers,
    selectedServer,
    isLoadingServers: isLoading, // Renamed for clarity if used with other loading states
    serverError: error,
    fetchServers, // Expose if manual refresh is needed
    selectServer,
    fetchSelectedServer, // Expose if manual refresh is needed
  };
};
