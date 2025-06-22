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

// Helper function to estimate upload size from request body
function estimateUploadSize(requestBody: chrome.webRequest.WebRequestBody | undefined, requestHeaders?: chrome.webRequest.HttpHeader[]): number {
  if (!requestBody) return 0;

  let uploadSize = 0;

  // Handle raw binary data
  if (requestBody.raw && Array.isArray(requestBody.raw)) {
    uploadSize = requestBody.raw.reduce((sum: number, part: any) => {
      if (part.bytes) {
        return sum + part.bytes.byteLength;
      } else if (part.file) {
        // For file uploads, we can't get the exact size here, but we can estimate
        // This will be handled better in onSendHeaders if Content-Length is available
        return sum;
      }
      return sum;
    }, 0);
  }

  // Handle form data
  if (requestBody.formData) {
    for (const [key, values] of Object.entries(requestBody.formData)) {
      if (Array.isArray(values)) {
        for (const value of values) {
          if (typeof value === 'string') {
            // Add key name + value + form encoding overhead
            uploadSize += key.length + value.length + 10; // ~10 bytes overhead per field
          }
        }
      }
    }
  }

  // If we couldn't estimate from body, try to get from Content-Length header
  if (uploadSize === 0 && requestHeaders) {
    const contentLengthHeader = requestHeaders.find(h => h.name.toLowerCase() === 'content-length');
    if (contentLengthHeader && contentLengthHeader.value) {
      uploadSize = parseInt(contentLengthHeader.value, 10) || 0;
    }
  }

  return uploadSize;
}

// Helper function to check if request method typically has a body
function methodHasBody(method: string): boolean {
  const methodsWithBody = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return methodsWithBody.includes(method.toUpperCase());
}

export function registerTabDataListeners() {
  // Download tracking (unchanged)
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

  // Primary upload tracking - using onBeforeRequest with requestBody
  chrome.webRequest.onBeforeRequest.addListener(
    function (details: chrome.webRequest.WebRequestBodyDetails) {
      (async () => {
        try {
          if (details.tabId < 0) return;

          // Only track methods that typically have request bodies
          if (!methodHasBody(details.method)) return;

          const uploadSize = estimateUploadSize(details.requestBody ?? undefined);

          if (uploadSize > 0) {
            const tabData = await getTabData(details.tabId);
            tabData.totalBytesUploaded += uploadSize;
            tabData.lastUploadTimestamp = details.timeStamp;
            await setTabData(details.tabId, tabData);
            console.log(`Tab ${details.tabId} uploaded ${uploadSize} bytes (${details.method} ${details.url}). Total: ${tabData.totalBytesUploaded}`);
          }
        } catch (e) {
          console.error('Error in onBeforeRequest upload tracking:', e);
        }
      })();
    },
    { urls: ['<all_urls>'] },
    ['requestBody']
  );

  // Secondary upload tracking - using onSendHeaders for Content-Length
  chrome.webRequest.onSendHeaders.addListener(
    async function (details: chrome.webRequest.WebRequestHeadersDetails) {
      try {
        if (details.tabId < 0) return;

        // Only track methods that typically have request bodies
        if (!methodHasBody(details.method)) return;

        let contentLength = 0;
        if (details.requestHeaders) {
          const header = details.requestHeaders.find(h => h.name.toLowerCase() === 'content-length');
          if (header && header.value) {
            contentLength = parseInt(header.value, 10);
          }
        }

        // Only count this if we have a significant upload size
        // This helps catch cases where onBeforeRequest couldn't estimate properly
        if (contentLength > 100) { // Ignore small requests to avoid double-counting
          const tabData = await getTabData(details.tabId);

          // Check if we might be double-counting by comparing timestamps
          const timeDiff = details.timeStamp - tabData.lastUploadTimestamp;

          // If the last upload was very recent (within 1 second), we might be double-counting
          if (timeDiff > 1000 || tabData.lastUploadTimestamp === 0) {
            tabData.totalBytesUploaded += contentLength;
            tabData.lastUploadTimestamp = details.timeStamp;
            await setTabData(details.tabId, tabData);
            console.log(`Tab ${details.tabId} uploaded ${contentLength} bytes via Content-Length (${details.method}). Total: ${tabData.totalBytesUploaded}`);
          }
        }
      } catch (e) {
        console.error("Error in onSendHeaders upload tracking:", e);
      }
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
  );

  // Enhanced upload tracking for streaming/chunked uploads
  chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details: chrome.webRequest.WebRequestHeadersDetails) {
      try {
        if (details.tabId < 0) return;
        if (!methodHasBody(details.method)) return;

        // Check for chunked transfer encoding or other indicators of streaming uploads
        if (details.requestHeaders) {
          const transferEncodingHeader = details.requestHeaders.find(h =>
            h.name.toLowerCase() === 'transfer-encoding' &&
            h.value?.toLowerCase().includes('chunked')
          );

          const contentTypeHeader = details.requestHeaders.find(h =>
            h.name.toLowerCase() === 'content-type'
          );

          // For chunked uploads or specific content types that indicate file uploads
          if (transferEncodingHeader ||
            (contentTypeHeader && (
              contentTypeHeader.value?.includes('multipart/form-data') ||
              contentTypeHeader.value?.includes('application/octet-stream')
            ))) {

            // We can't know the exact size yet, but we can prepare to track it
            // The actual size will be captured in subsequent events
            console.log(`Tab ${details.tabId} detected potential chunked/file upload: ${details.url}`);
          }
        }
      } catch (e) {
        console.error("Error in onBeforeSendHeaders upload detection:", e);
      }
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
  );

  // Cleanup when tabs are closed
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