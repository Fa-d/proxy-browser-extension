import { useState, useEffect, useCallback } from 'react';
import { Server } from '../../domain/models/Server';
import { ConnectionDetails } from '../../domain/models/ConnectionDetails';
import { ProxyService } from '../../application/services/ProxyService';

const proxyService = new ProxyService();

export const useProxy = () => {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hookError, setHookError] = useState<string | null>(null);
  const [proxyError, setProxyError] = useState<string | null>(null);

  const fetchConnectionDetails = useCallback(async () => {
    setHookError(null);
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

  useEffect(() => {
    const messageListener = (
      request: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (request.type === "proxyError") {
        setProxyError(request.message);
        setHookError(null);
      } else if (request.type === "proxySuccess") {
        setProxyError(null);
      }
      return undefined;
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => { chrome.runtime.onMessage.removeListener(messageListener); };

  }, []);

  const clearProxyError = () => {
    setProxyError(null);
  };

  const connect = useCallback(async (server: Server) => {
    console.log("Connecting to proxy server:", server);
    setIsLoading(true);
    setHookError(null);
    setProxyError(null);
    try {
      await proxyService.connect(server);
      await fetchConnectionDetails();
    } catch (err: any) {
      setHookError(err.message || 'Failed to connect to proxy'); // Use renamed setter
      await fetchConnectionDetails();
    } finally {
      setIsLoading(false);
    }
  }, [fetchConnectionDetails]);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    setHookError(null); // Use renamed setter
    setProxyError(null); // Clear background error on new action
    try {
      await proxyService.disconnect();
      await fetchConnectionDetails();
    } catch (err: any) {
      setHookError(err.message || 'Failed to disconnect from proxy'); // Use renamed setter
      await fetchConnectionDetails();
    } finally {
      setIsLoading(false);
    }
  }, [fetchConnectionDetails]);

  return {
    connectionDetails,
    isConnecting: isLoading,
    proxyError: proxyError || hookError, // Combine errors, background error takes precedence
    clearProxyError, // Added this
    connectProxy: connect,
    disconnectProxy: disconnect,
    refreshConnectionDetails: fetchConnectionDetails
  };
};
