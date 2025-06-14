import { useState, useEffect, useCallback } from 'react';
import { Server } from '../../domain/models/Server';
import { ConnectionDetails } from '../../domain/models/ConnectionDetails';
import { ProxyService } from '../../application/services/ProxyService';

const proxyService = new ProxyService();

export const useProxy = () => {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hookError, setHookError] = useState<string | null>(null); // Renamed from error
  const [proxyError, setProxyError] = useState<string | null>(null); // New state for background messages

  const fetchConnectionDetails = useCallback(async () => {
    setHookError(null); // Use renamed setter
    try {
      const details = await proxyService.getConnectionDetails();
      setConnectionDetails(details);
    } catch (err: any) {
      // This catch is empty in original, consider if setHookError should be used here
    } finally {
      // Empty in original
    }
  }, []);

  useEffect(() => {
    fetchConnectionDetails();
    const intervalId = setInterval(() => {
      fetchConnectionDetails();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [fetchConnectionDetails]);

  // Listener for messages from background script
  useEffect(() => {
    const messageListener = (
      request: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (request.type === "proxyError") {
        setProxyError(request.message);
        setHookError(null); // Clear other hook-specific errors if a background error comes in
      } else if (request.type === "proxySuccess") {
        setProxyError(null); // Clear error on success
      }
      return undefined; // Not sending a response back
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const clearProxyError = () => {
    setProxyError(null);
  };

  const connect = useCallback(async (server: Server) => {
    setIsLoading(true);
    setHookError(null); // Use renamed setter
    setProxyError(null); // Clear background error on new action
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
    // If hookError should also be displayed, it needs to be returned.
    // For now, sticking to the prompt to return `proxyError` for background messages.
    // The original `proxyError: error` implied the hook's own error.
    // To avoid confusion and fulfill the prompt, we return the new proxyError.
    // If both are needed, they should have distinct names in the return object.
    proxyError: proxyError || hookError, // Combine errors, background error takes precedence
    clearProxyError, // Added this
    connectProxy: connect,
    disconnectProxy: disconnect,
    refreshConnectionDetails: fetchConnectionDetails
  };
};
