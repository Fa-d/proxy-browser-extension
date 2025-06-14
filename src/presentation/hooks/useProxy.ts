import { useState, useEffect, useCallback } from 'react';
import { Server } from '../../domain/models/Server';
import { ConnectionDetails } from '../../domain/models/ConnectionDetails';
import { ProxyService } from '../../application/services/ProxyService';

const proxyService = new ProxyService();

export const useProxy = () => {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectionDetails = useCallback(async () => {
    setError(null);
    try {
      const details = await proxyService.getConnectionDetails();
      setConnectionDetails(details);
    } catch (err: any) {
    } finally {
    }
  }, []);

  useEffect(() => {
    fetchConnectionDetails();
    const intervalId = setInterval(() => {
      fetchConnectionDetails();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [fetchConnectionDetails]);


  const connect = useCallback(async (server: Server) => {
    setIsLoading(true);
    setError(null);
    try {
      await proxyService.connect(server);
      await fetchConnectionDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to connect to proxy');
      await fetchConnectionDetails();
    } finally {
      setIsLoading(false);
    }
  }, [fetchConnectionDetails]);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await proxyService.disconnect();
      await fetchConnectionDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect from proxy');
      await fetchConnectionDetails();
    } finally {
      setIsLoading(false);
    }
  }, [fetchConnectionDetails]);

  return {
    connectionDetails,
    isConnecting: isLoading,
    proxyError: error,
    connectProxy: connect,
    disconnectProxy: disconnect,
    refreshConnectionDetails: fetchConnectionDetails
  };
};
