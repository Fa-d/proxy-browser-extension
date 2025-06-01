import { useState, useEffect, useCallback } from 'react';
import { SpeedInfo } from '../../domain/models/SpeedInfo';
import { SpeedService } from '../../application/services/SpeedService';

const speedService = new SpeedService(); // Instantiate the service
const UPDATE_INTERVAL_MS = 2000; // How often to fetch updated speed from the service

export const useSpeedometer = () => {
  const [speedInfo, setSpeedInfo] = useState<SpeedInfo | null>(null);
  const [currentMonitoringTabId, setCurrentMonitoringTabId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // True initially until first data comes
  // Error state can be added if SpeedService methods can throw errors to be shown on UI
  // const [error, setError] = useState<string | null>(null);

  const fetchSpeed = useCallback(async () => {
    // setError(null);
    try {
      const info = await speedService.getCurrentSpeed();
      setSpeedInfo(info);
      if (isLoading && info !== null) { // Stop loading once we get first non-null data
        setIsLoading(false);
      } else if (info === null && !isLoading){
        // If info becomes null after initial load, it means no data for current tab.
        // Could set a specific state for "no data" or "calculating"
      }
    } catch (err: any) {
      console.error("useSpeedometer - fetchSpeed error:", err);
      // setError(err.message || "Failed to fetch speed info");
      setIsLoading(false); // Stop loading on error too
    }
  }, [isLoading]); // Include isLoading to allow effect to re-evaluate if it changes

  // Effect for managing monitoring based on active tab
  useEffect(() => {
    let isActive = true; // To prevent updates on unmounted component
    let intervalId: NodeJS.Timeout | null = null;

    const manageMonitoring = async () => {
      if (!chrome.tabs) { // In case run in a context without chrome.tabs (e.g. web page for testing)
        console.warn("useSpeedometer: chrome.tabs API not available.");
        setIsLoading(false);
        return;
      }

      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (isActive && tabs && tabs.length > 0 && tabs[0].id != null) {
          const activeTabId = tabs[0].id;
          if (currentMonitoringTabId !== activeTabId) {
            // console.log(`useSpeedometer: Active tab changed to ${activeTabId}. Starting monitoring.`);
            speedService.startMonitoringForTab(activeTabId);
            setCurrentMonitoringTabId(activeTabId);
            setIsLoading(true); // Set loading when tab changes until first data for new tab
          }
          // Fetch speed immediately after confirming/starting monitoring
          await fetchSpeed();

          // Set up polling interval
          if (intervalId) clearInterval(intervalId); // Clear previous interval
          intervalId = setInterval(fetchSpeed, UPDATE_INTERVAL_MS);

        } else if (currentMonitoringTabId !== null) {
          // No active tab found, or tab has no ID, stop monitoring
          // console.log("useSpeedometer: No active tab or tab ID missing. Stopping monitoring.");
          speedService.stopMonitoringForAllTabs();
          setCurrentMonitoringTabId(null);
          setSpeedInfo(null);
          setIsLoading(false);
        } else {
           setIsLoading(false); // No tab to monitor, not loading.
        }
      } catch (e) {
        console.error("useSpeedometer: Error querying tabs or managing monitoring", e);
        setIsLoading(false);
      }
    };

    manageMonitoring(); // Initial call

    // Listener for tab activation changes
    const handleTabActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      // console.log("useSpeedometer: Tab activated event", activeInfo);
      // Re-run monitoring management when tab changes
      // Reset loading state for the new tab.
      setIsLoading(true);
      setSpeedInfo(null); // Clear old speed info
      manageMonitoring();
    };

    const handleTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
        // If the updated tab is the one we are monitoring and URL has changed (navigation)
        if (tabId === currentMonitoringTabId && changeInfo.url) {
            // console.log(`useSpeedometer: Monitored tab ${tabId} updated URL to ${changeInfo.url}. Re-evaluating monitoring.`);
            // Potentially reset speed data or re-initiate monitoring if needed,
            // for now, continuous monitoring should handle it.
            // setIsLoading(true);
            // setSpeedInfo(null);
            // manageMonitoring(); // Could re-trigger to reset states if necessary
        }
    };

    if (chrome.tabs && chrome.tabs.onActivated) {
      chrome.tabs.onActivated.addListener(handleTabActivated);
    }
    if (chrome.tabs && chrome.tabs.onUpdated) {
      chrome.tabs.onUpdated.addListener(handleTabUpdated);
    }

    return () => {
      isActive = false;
      // console.log("useSpeedometer: Cleanup. Stopping monitoring and clearing interval.");
      if (intervalId) clearInterval(intervalId);
      speedService.stopMonitoringForAllTabs();
      if (chrome.tabs && chrome.tabs.onActivated) {
        chrome.tabs.onActivated.removeListener(handleTabActivated);
      }
      if (chrome.tabs && chrome.tabs.onUpdated) {
        chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      }
    };
  }, [fetchSpeed]); // currentMonitoringTabId removed from deps to avoid re-triggering on its own change

  return { speedInfo, isLoading };
};
