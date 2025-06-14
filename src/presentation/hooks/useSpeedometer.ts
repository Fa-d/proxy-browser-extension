import { useState, useEffect, useCallback } from 'react';
import { SpeedInfo } from '../../domain/models/SpeedInfo';
import { SpeedService } from '../../application/services/SpeedService';

const speedService = new SpeedService(); 
const UPDATE_INTERVAL_MS = 2000; 

export const useSpeedometer = () => {
  const [speedInfo, setSpeedInfo] = useState<SpeedInfo | null>(null);
  const [currentMonitoringTabId, setCurrentMonitoringTabId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); 

  const fetchSpeed = useCallback(async () => {
    try {
      const info = await speedService.getCurrentSpeed();
      setSpeedInfo(info);
      if (isLoading && info !== null) {
        setIsLoading(false);
      } else if (info === null && !isLoading){

      }
    } catch (err: any) {
      console.error("useSpeedometer - fetchSpeed error:", err);
      setIsLoading(false); 
    }
  }, [isLoading]);

  useEffect(() => {
    let isActive = true; 
    let intervalId: NodeJS.Timeout | null = null;

    const manageMonitoring = async () => {
      if (!chrome.tabs) {
        setIsLoading(false);
        return;
      }

      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (isActive && tabs && tabs.length > 0 && tabs[0].id != null) {
          const activeTabId = tabs[0].id;
          if (currentMonitoringTabId !== activeTabId) {
            speedService.startMonitoringForTab(activeTabId);
            setCurrentMonitoringTabId(activeTabId);
            setIsLoading(true); 
          }
          await fetchSpeed();
          if (intervalId) clearInterval(intervalId); 
          intervalId = setInterval(fetchSpeed, UPDATE_INTERVAL_MS);

        } else if (currentMonitoringTabId !== null) {
          speedService.stopMonitoringForAllTabs();
          setCurrentMonitoringTabId(null);
          setSpeedInfo(null);
          setIsLoading(false);
        } else {
           setIsLoading(false); 
        }
      } catch (e) {
        console.error("useSpeedometer: Error querying tabs or managing monitoring", e);
        setIsLoading(false);
      }
    };

    manageMonitoring(); 

    const handleTabActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      setIsLoading(true);
      setSpeedInfo(null);
      manageMonitoring();
    };

    const handleTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
        if (tabId === currentMonitoringTabId && changeInfo.url) {

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
      if (intervalId) clearInterval(intervalId);
      speedService.stopMonitoringForAllTabs();
      if (chrome.tabs && chrome.tabs.onActivated) {
        chrome.tabs.onActivated.removeListener(handleTabActivated);
      }
      if (chrome.tabs && chrome.tabs.onUpdated) {
        chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      }
    };
  }, [fetchSpeed]);

  return { speedInfo, isLoading };
};
