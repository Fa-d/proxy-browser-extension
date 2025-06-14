// Example PAC script pattern for documentation:
let currentAuthCredentials: { username?: string; password?: string; } | null = null;

// function FindProxyForURL(url, host) {
//   if (shExpMatch(host, '*.example.com')) {
//     return 'PROXY proxy.example.com:443';
//   }
//   return 'DIRECT';
// }

function showNotification(title: string, message: string) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "img/thunder.png", // Updated path
    title: title,
    message: message
  });
}

function setProxy(passedUrl: string) {
  var config = {
    mode: "pac_script",
    pacScript: {
      url: passedUrl
    }
  };

  chrome.proxy.settings.set({
    value: config,
    scope: "regular"
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting PAC script:", chrome.runtime.lastError.message);
      showNotification("Proxy Error", `Failed to set PAC script: ${chrome.runtime.lastError.message}`);
      chrome.runtime.sendMessage({
        type: "proxyError",
        message: `Failed to set PAC script: ${chrome.runtime.lastError.message}`
      });
    } else {
      console.log(`PAC script enabled from: ${passedUrl}`);
      showNotification("Proxy Enabled", `Proxy set to: ${passedUrl}`);
      chrome.runtime.sendMessage({ type: "proxySuccess", message: `Proxy enabled: ${passedUrl}` });
    }
  });
}

function clearProxy() {
  chrome.proxy.settings.clear({
    scope: "regular"
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error clearing proxy:", chrome.runtime.lastError.message);
      showNotification("Proxy Error", `Failed to clear proxy: ${chrome.runtime.lastError.message}`);
      chrome.runtime.sendMessage({
        type: "proxyError",
        message: `Failed to clear proxy: ${chrome.runtime.lastError.message}`
      });
    } else {
      console.log("Proxy cleared");
      showNotification("Proxy Cleared", "Disconnected from proxy server");
      chrome.runtime.sendMessage({ type: "proxySuccess", message: "Proxy cleared" });
    }
  });
}

// Named listener function for onAuthRequired
const authRequiredListener = function(details: chrome.webRequest.WebRequestDetails) { // Using WebRequestDetails as a general type
  try {
    if (currentAuthCredentials && currentAuthCredentials.username && currentAuthCredentials.password) {
      console.log("Using credentials for auth challenge:", currentAuthCredentials.username);
      return { authCredentials: currentAuthCredentials };
    }
    console.log("Authentication required, but no credentials available. URI: " + details.url);
    return {};
  } catch (e) {
    console.error("Error in onAuthRequired listener:", e);
    return { cancel: true };
  }
};

async function checkProxyFunctionality(pacUrl: string, username?: string, password?: string) {
  const testUrl = 'https://www.google.com/generate_204';
  let originalProxySettings: any = null;
  let originalAuthCredentials: { username?: string; password?: string; } | null = currentAuthCredentials ? {...currentAuthCredentials} : null;

  try {
    originalProxySettings = await new Promise<any>((resolve) => { // Explicitly typing Promise
      chrome.proxy.settings.get({ incognito: false }, (config) => {
        resolve(config);
      });
    });

    currentAuthCredentials = { username, password };

    const testConfig = {
      mode: "pac_script",
      pacScript: { url: pacUrl }
    };
    await new Promise<void>((resolve, reject) => { // Explicitly typing Promise
      chrome.proxy.settings.set({ value: testConfig, scope: "regular" }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error setting proxy for test:", chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log("Proxy set for test, attempting fetch...");
          resolve();
        }
      });
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(testUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    console.log("Test fetch response status:", response.status);
    if (!response.ok || response.status !== 204) {
      throw new Error(`Test fetch failed with status: ${response.status}`);
    }

    console.log("Proxy functionality test successful.");
    return true;

  } catch (error: any) { // Typing error
    console.error("Proxy functionality test failed:", error.message);
    showNotification("Proxy Test Failed", `Could not connect via proxy: ${error.message}. Check server and credentials.`);
    chrome.runtime.sendMessage({
      type: "proxyError",
      message: `Proxy test failed: ${error.message}. Check server and credentials.`
    });
    return false;

  } finally {
    currentAuthCredentials = originalAuthCredentials;
    if (originalProxySettings) {
      await new Promise<void>((resolve, reject) => { // Explicitly typing Promise
        chrome.proxy.settings.set({ value: originalProxySettings.value, scope: "regular" }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error reverting proxy settings:", chrome.runtime.lastError.message);
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            console.log("Proxy settings reverted.");
            resolve();
          }
        });
      });
    }
  }
}


chrome.runtime.onMessage.addListener(async (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  try {
    if (request.action === 'setProxy') {
      if (chrome.webRequest.onAuthRequired.hasListener(authRequiredListener)) {
        chrome.webRequest.onAuthRequired.removeListener(authRequiredListener);
      }
      chrome.webRequest.onAuthRequired.addListener(
        authRequiredListener,
        { urls: ["<all_urls>"] },
        ['asyncBlocking']
      );

      if (request.url === "" || request.url == undefined) {
        currentAuthCredentials = null;
        clearProxy();
        sendResponse({ status: "Proxy cleared" });
      } else {
        const isFunctional = await checkProxyFunctionality(request.url, request.username, request.password);

        if (isFunctional) {
          console.log("Proxy test successful. Setting proxy permanently...");
          currentAuthCredentials = { username: request.username, password: request.password };
          setProxy(request.url);
          sendResponse({ status: "Proxy set", url: request.url });
        } else {
          console.log("Proxy test failed. Not setting proxy.");
          sendResponse({ status: "Proxy test failed" });
        }
      }
    }
  } catch (e: any) { // Typing error
    console.error("Error in onMessage listener:", e);
    if (sendResponse) {
      try {
        sendResponse({ status: "error", message: e.message });
      } catch (sendError: any) { // Typing error
        console.error("Error sending error response:", sendError);
      }
    }
  }
  return true;
});

interface TabData {
  totalBytesDownloaded: number;
  lastDownloadTimestamp: number;
  totalBytesUploaded: number;
  lastUploadTimestamp: number;
}

async function getTabData(tabId: number): Promise<TabData> {
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

async function setTabData(tabId: number, data: TabData): Promise<void> {
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

chrome.webRequest.onCompleted.addListener(
  async function (details: chrome.webRequest.WebResponseCacheDetails) { // More specific type
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
  async function (details: chrome.webRequest.WebRequestHeadersDetails) { // Specific type
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
// Ensure all functions that might be called from other modules are exported if necessary.
// For background scripts, typically functions are self-contained or triggered by browser events.
export {}; // Add this if there are no other exports to make it a module
