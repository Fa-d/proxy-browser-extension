import { useState, useEffect, useCallback } from 'react';
import { Server } from '../../domain/models/Server';
import { ConnectionDetails } from '../../domain/models/ConnectionDetails';
import { ProxyService } from '../../application/services/ProxyService';

const proxyService = new ProxyService();

export const useProxy = () => {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For connect/disconnect actions
  const [isPolling, setIsPolling] = useState<boolean>(false); // For background polling of status/IP
  const [error, setError] = useState<string | null>(null);

  const fetchConnectionDetails = useCallback(async () => {
    // This can be called frequently, so don't set main isLoading for it
    // unless it's a specific user-initiated refresh.
    // setIsPolling(true); // Indicate background activity
    setError(null);
    try {
      const details = await proxyService.getConnectionDetails();
      setConnectionDetails(details);
    } catch (err: any) {
      console.error("useProxy - fetchConnectionDetails error:", err);
      // Don't necessarily set a visible error for failed polls, could be transient
      // setError(err.message || 'Failed to fetch connection details');
    } finally {
      // setIsPolling(false);
    }
  }, []);

  // Initial fetch and polling for IP and connection status
  useEffect(() => {
    fetchConnectionDetails(); // Initial fetch
    const intervalId = setInterval(() => {
      fetchConnectionDetails();
    }, 5000); // Poll every 5 seconds, adjust as needed

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

  // Effect to update connection details if isConnected state changes from an external source (e.g. browser action)
  // This relies on chrome.proxy.onProxyError and chrome.proxy.settings.onChange if available,
  // or more frequent polling if direct event listening isn't feasible in the hook.
  // For now, the polling handles updates.

  return {
    connectionDetails,
    isConnecting: isLoading, // Renamed for clarity
    isPollingConnectionDetails: isPolling,
    proxyError: error,
    connectProxy: connect,
    disconnectProxy: disconnect,
    refreshConnectionDetails: fetchConnectionDetails, // Expose manual refresh
  };
};
