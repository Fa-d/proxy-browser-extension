// src/background/tabData.ts
export interface TabData {
  totalBytesDownloaded: number;
  lastDownloadTimestamp: number;
  totalBytesUploaded: number;
  lastUploadTimestamp: number;
}

export async function getTabData(tabId: number): Promise<TabData> {
  const key = "tab_" + tabId;
  try {
    const result = await new Promise<{ [key: string]: TabData }>((resolve) => chrome.storage.local.get([key], resolve));
    return result[key] || {
      totalBytesDownloaded: 0,
      lastDownloadTimestamp: Date.now(),
      totalBytesUploaded: 0,
      lastUploadTimestamp: Date.now(),
    };
  } catch (e) {
    console.error("Error getting tab data from storage:", e);
    return {
      totalBytesDownloaded: 0,
      lastDownloadTimestamp: Date.now(),
      totalBytesUploaded: 0,
      lastUploadTimestamp: Date.now(),
    };
  }
}

export async function setTabData(tabId: number, data: TabData): Promise<void> {
  const key = "tab_" + tabId;
  try {
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ [key]: data }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  } catch (e) {
    console.error("Error setting tab data to storage:", e);
  }
}

export function registerTabDataListeners() {
  chrome.webRequest.onCompleted.addListener(
    async function (details: chrome.webRequest.WebResponseCacheDetails) {
      try {
        if (details.tabId < 0) return;
        if (details.fromCache) return;
        let contentLength = 0;
        if (details.responseHeaders) {
          const header = details.responseHeaders.find(h => h.name.toLowerCase() === 'content-length');
          if (header && header.value) {
            contentLength = parseInt(header.value, 10);
          }
        }
        if (contentLength > 0) {
          const tabData = await getTabData(details.tabId);
          tabData.totalBytesDownloaded += contentLength;
          tabData.lastDownloadTimestamp = details.timeStamp;
          await setTabData(details.tabId, tabData);
          console.log(`Tab ${details.tabId} downloaded ${contentLength} bytes. Total: ${tabData.totalBytesDownloaded}`);
        }
      } catch (e) {
        console.error("Error in onCompleted listener:", e);
      }
    },
    { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"] },
    ["responseHeaders"]
  );

  chrome.webRequest.onSendHeaders.addListener(
    async function (details: chrome.webRequest.WebRequestHeadersDetails) {
      try {
        if (details.tabId < 0) return;
        let contentLength = 0;
        if (details.requestHeaders) {
          const header = details.requestHeaders.find(h => h.name.toLowerCase() === 'content-length');
          if (header && header.value) {
            contentLength = parseInt(header.value, 10);
          }
        }
        if (contentLength > 0) {
          const tabData = await getTabData(details.tabId);
          tabData.totalBytesUploaded += contentLength;
          tabData.lastUploadTimestamp = details.timeStamp;
          await setTabData(details.tabId, tabData);
          console.log(`Tab ${details.tabId} uploaded ${contentLength} bytes. Total: ${tabData.totalBytesUploaded}`);
        }
      } catch (e) {
        console.error("Error in onSendHeaders listener:", e);
      }
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
  );

  chrome.tabs.onRemoved.addListener(function (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) {
    try {
      const key = "tab_" + tabId;
      chrome.storage.local.remove(key, function () {
        if (chrome.runtime.lastError) {
          console.error("Error removing tab data:", chrome.runtime.lastError);
        } else {
          console.log("Removed data for closed tab:", tabId);
        }
      });
    } catch (e) {
      console.error("Error in onRemoved listener:", e);
    }
  });
}
