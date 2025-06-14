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
      const srvs = await serverService.getServers();
      setServers(srvs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch servers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSelectedServer = useCallback(async () => {
    setError(null);
    try {
      const srv = await serverService.getSelectedServer();
      setSelectedServer(srv);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch selected server');
    }
  }, []);

  const selectServer = useCallback(async (server: Server) => {
    setError(null);
    try {
      await serverService.selectServer(server);
      setSelectedServer(server); 
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
    isLoadingServers: isLoading, 
    serverError: error,
    fetchServers,
    selectServer,
    fetchSelectedServer,
  };
};
