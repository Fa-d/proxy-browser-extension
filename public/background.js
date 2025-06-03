chrome.webRequest.onAuthRequired.addListener(
  function (details) {
    return {
      authCredentials: {
        username: 'azvesxqf',
        password: 'i4904jb14zb9',
      }
    };
  },
  { urls: ["<all_urls>"] },
  ['blocking']
);

function setProxy(passedUrl) {
  var config = {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        scheme: "https",
        host: passedUrl,
        port: 443
      },
      bypassList: [
        "<local>",
        "localhost",
        "127.0.0.1",
        "[::1]",
        "*.local",
        "10.0.0.0/8",
        "172.16.0.0/12",
        "192.168.0.0/16"
      ]
    }
  };

  chrome.proxy.settings.set({
    value: config,
    scope: "regular"
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting proxy:", chrome.runtime.lastError.message);
      showNotification("Proxy Error", `Failed to set proxy: ${chrome.runtime.lastError.message}`);
    } else {
      console.log(`Proxy enabled: https://${proxySettings.serverAddress}:${proxySettings.serverPort}`);
      showNotification("Proxy Enabled", `Connected via https://${proxySettings.serverAddress}:${proxySettings.serverPort}`);
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
    } else {
      console.log("Proxy cleared");
      showNotification("Proxy Cleared", "Disconnected from proxy server");
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setProxy') {

    if (chrome.webRequest.onAuthRequired.hasListener()) {
      chrome.webRequest.onAuthRequired.removeListener();
    }

    chrome.webRequest.onAuthRequired.addListener(
      function (details) {
        return {
          authCredentials: {
            username: 'azvesxqf',
            password: 'i4904jb14zb9',
          }
        };
      },
      { urls: ["<all_urls>"] },
      ['blocking']
    );
    if (request.url === "" || request.url == undefined) {
      clearProxy();
      sendResponse({ status: "Proxy cleared" });
    }
    else {
      setProxy(request.url);
      sendResponse({ status: "Proxy set", url: request.url });
    }
  }
});


async function getTabData(tabId) {
  const key = "tab_" + tabId;
  try {
    const result = await new Promise((resolve) => chrome.storage.local.get([key], resolve));
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

async function setTabData(tabId, data) {
  const key = "tab_" + tabId;
  try {
    await new Promise((resolve, reject) => {
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
  async function (details) {
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
  },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"] },
  ["responseHeaders"]
);

chrome.webRequest.onSendHeaders.addListener(
  async function (details) {
    if (details.tabId < 0) return;

    let contentLength = 0;
    if (details.requestHeaders) {
      const header = details.requestHeaders.find(h => h.name.toLowerCase() === 'content-length');
      if (header && header.value) {
        contentLength = parseInt(header.value, 10);
      }
    }

    // Fallback to requestBody size if Content-Length header is not present for uploads
    // This part is tricky as onSendHeaders doesn't have requestBody.
    // We might need to combine with onBeforeRequest for a more comprehensive upload tracking,
    // but that adds complexity in correlating requests.
    // For now, we primarily rely on Content-Length in request headers.
    // If `details.requestBody` was available and reliable here, we could use it:
    // if (contentLength === 0 && details.requestBody && details.requestBody.raw) {
    //   details.requestBody.raw.forEach(part => {
    //     if (part.bytes && part.bytes.byteLength) {
    //       contentLength += part.bytes.byteLength;
    //     }
    //   });
    // }


    if (contentLength > 0) {
      const tabData = await getTabData(details.tabId);
      tabData.totalBytesUploaded += contentLength;
      tabData.lastUploadTimestamp = details.timeStamp; // Use request timestamp
      await setTabData(details.tabId, tabData);
      console.log(`Tab ${details.tabId} uploaded ${contentLength} bytes. Total: ${tabData.totalBytesUploaded}`);
    }
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  const key = "tab_" + tabId;
  chrome.storage.local.remove(key, function () {
    if (chrome.runtime.lastError) {
      console.error("Error removing tab data:", chrome.runtime.lastError);
    } else {
      console.log("Removed data for closed tab:", tabId);
    }
  });
});

