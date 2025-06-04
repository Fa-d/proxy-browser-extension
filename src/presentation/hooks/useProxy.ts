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
      console.error("useProxy - fetchConnectionDetails error:", err);
    } finally {
    }
  }, []);

  useEffect(() => {
    fetchConnectionDetails(); // Initial fetch
    const intervalId = setInterval(() => {
      fetchConnectionDetails();
    }, 5000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchConnectionDetails]);


  const connect = useCallback(async (server: Server) => {
    setIsLoading(true);
    setError(null);
    try {
      await proxyService.connect(server);
      // After connect, refresh details
      await fetchConnectionDetails();
    } catch (err: any) {
      console.error("useProxy - connect error:", err);
      setError(err.message || 'Failed to connect to proxy');
      // Optionally, re-fetch details even on error to get latest state
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
      // After disconnect, refresh details
      await fetchConnectionDetails();
    } catch (err: any) {
      console.error("useProxy - disconnect error:", err);
      setError(err.message || 'Failed to disconnect from proxy');
      // Optionally, re-fetch details even on error to get latest state
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
