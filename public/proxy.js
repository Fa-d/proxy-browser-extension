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
    var config = {}
    if (passedUrl.length == 0) {
        config = {
            mode: "direct",
        }
    } else {
        config = {
            mode: "fixed_servers",
            rules: {
                singleProxy: {
                    scheme: "http",
                    host: passedUrl.split(":")[0],
                    port: parseInt(passedUrl.split(":")[1])
                },
                bypassList: ["localhost"]
            }
        };
     }

    chrome.proxy.settings.set({
        value: config,
        scope: "regular"
    }, function () { });
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
        if(request.url != undefined){
            setProxy(request.url);
        }
    }
});

chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        const size = details.requestBody ? details.requestBody.raw[0].bytes.length : 0;
        // chrome.storage.local.set({
        //     [details.tabId]: {
        //         startTime: performance.now(),
        //         size: size
        //     }
        // });
    },
    { urls: ["<all_urls>"] }
);

chrome.webRequest.onCompleted.addListener(
    function (details) {
        //     chrome.storage.local.get([details.tabId], function (result) {
        //         const data = result[details.tabId];
        //         if (data) {
        //             const duration = (performance.now() - data.startTime) / 1000;
        //             const speed = data.size / duration;
        //             chrome.storage.local.set({
        //                 [details.tabId]: {
        //                     speed: speed
        //                 }
        //             });
        //         }
        //     });
    },
    { urls: ["<all_urls>"] }
);

// --- Start of new code for speed calculation ---

// Helper to get data from storage or initialize if not present
async function getTabData(tabId) {
  const key = "tab_" + tabId;
  try {
    const result = await new Promise((resolve) => chrome.storage.local.get([key], resolve));
    return result[key] || {
      totalBytesDownloaded: 0,
      lastDownloadTimestamp: Date.now(), // Initialize timestamp
      totalBytesUploaded: 0,
      lastUploadTimestamp: Date.now(),   // Initialize timestamp
    };
  } catch (e) {
    console.error("Error getting tab data from storage:", e);
    return { // Return default on error
      totalBytesDownloaded: 0,
      lastDownloadTimestamp: Date.now(),
      totalBytesUploaded: 0,
      lastUploadTimestamp: Date.now(),
    };
  }
}

// Helper to set data to storage
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

// Listener for completed requests (downloads)
chrome.webRequest.onCompleted.addListener(
  async function(details) {
    if (details.tabId < 0) return; // Ignore requests not associated with a tab (e.g., background requests by extension itself)
    if (details.fromCache) return; // Don't count cached responses as "new" downloads

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
      tabData.lastDownloadTimestamp = details.timeStamp; // Use request timestamp for more accuracy
      await setTabData(details.tabId, tabData);
      // console.log(`Tab ${details.tabId} downloaded ${contentLength} bytes. Total: ${tabData.totalBytesDownloaded}`);
    }
  },
  { urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"] }, // Listen to common resource types
  ["responseHeaders"]
);

// Listener for request headers sent (uploads)
chrome.webRequest.onSendHeaders.addListener(
  async function(details) {
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
      // console.log(`Tab ${details.tabId} uploaded ${contentLength} bytes. Total: ${tabData.totalBytesUploaded}`);
    }
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);

// Listener for when a tab is removed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  const key = "tab_" + tabId;
  chrome.storage.local.remove(key, function() {
    if (chrome.runtime.lastError) {
      // console.error("Error removing tab data:", chrome.runtime.lastError);
    } else {
      // console.log("Removed data for closed tab:", tabId);
    }
  });
});

// --- End of new code for speed calculation ---
