// src/background/speedBroadcaster.ts
import { SpeedService } from '../application/services/SpeedService';

const speedService = new SpeedService();
let intervalId: NodeJS.Timeout | null = null;
let lastTabId: number | null = null;

export function startSpeedBroadcasting() {
  if (intervalId) return;
  intervalId = setInterval(async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0 && tabs[0].id != null) {
        const tabId = tabs[0].id;
        if (lastTabId !== tabId) {
          speedService.startMonitoringForTab(tabId);
          lastTabId = tabId;
        }
        const speedInfo = await speedService.getCurrentSpeed();
        chrome.runtime.sendMessage({ action: 'speedUpdate', speedInfo });
      }
    } catch (e) {
      // ignore
    }
  }, 2000);
}

export function stopSpeedBroadcasting() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    lastTabId = null;
    speedService.stopMonitoringForAllTabs();
  }
}
