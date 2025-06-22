export async function setCurrentAuthCredentials(creds: { username?: string; password?: string; } | null) {
  if (creds) {
    await chrome.storage.local.set({ proxyAuthCredentials: creds });
  } else {
    await chrome.storage.local.remove('proxyAuthCredentials');
  }
}

export async function getCurrentAuthCredentials(): Promise<{ username?: string; password?: string; } | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['proxyAuthCredentials'], (result) => {
      resolve(result.proxyAuthCredentials || null);
    });
  });
}

export function setProxy(passedUrl: string) {

  // const pacScriptConfig = {
  //   mode: "pac_script",
  //   pacScript: {
  //     data: `
  //     function FindProxyForURL(url, host) {
  //       return "PROXY ${passedUrl}:443";
  //     }
  //   `
  //   }
  // };

  const pacScriptConfig = {
    mode: "fixed_servers",
    rules: {
      proxyForHttp: {
        scheme: "https",
        host: passedUrl,
        port: 443
      },
      proxyForHttps: {
        scheme: "https",
        host: passedUrl,
        port: 443
      },
      bypassList: ["foobar.com"]
    }
  }

  chrome.proxy.settings.set({ value: pacScriptConfig, scope: "regular" }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting PAC script:", chrome.runtime.lastError.message);
      chrome.runtime.sendMessage({ type: "proxyError", message: `Failed to set PAC script: ${chrome.runtime.lastError.message}` });
    } else {
      console.log(`PAC script enabled from: ${passedUrl}`);
      chrome.runtime.sendMessage({ type: "proxySuccess", message: `Proxy enabled: ${passedUrl}` });
    }
  });
}

export function clearProxy() {
  chrome.proxy.settings.clear({ scope: "regular" }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error clearing proxy:", chrome.runtime.lastError.message);
      chrome.runtime.sendMessage({ type: "proxyError", message: `Failed to clear proxy: ${chrome.runtime.lastError.message}` });
    } else {
      console.log("Proxy cleared");
      chrome.runtime.sendMessage({ type: "proxySuccess", message: "Proxy cleared" });
    }
  });
}

export function authRequiredListener(
  details: chrome.webRequest.WebAuthenticationChallengeDetails,
  callback?: (response: chrome.webRequest.BlockingResponse) => void
) {
  getCurrentAuthCredentials().then((creds) => {
    if (creds && creds.username && creds.password) {
      console.log("Using credentials for auth challenge:" + creds.username + " " + creds.password);
      //if (callback) callback({ authCredentials: { username: creds.username, password: creds.password } });
      if (callback) callback({ authCredentials: { username: "admin", password: "123456" } });
    } else {
      console.log("Authentication required, but no credentials available. Cancelling request to prevent popup. URI: " + details.url);
      if (callback) callback({ cancel: true });
    }
  }).catch((e) => {
    console.error("Error in onAuthRequired listener:", e);
    if (callback) callback({ cancel: true });
  });
}

export async function checkProxyFunctionality(pacUrl: string, username?: string, password?: string) {
  const testUrl = 'https://www.google.com/generate_204';
  let originalAuthCredentials: { username?: string; password?: string; } | null = await getCurrentAuthCredentials();
  let originalProxySettings: any = null;
  try {
    originalProxySettings = await new Promise<any>((resolve) => {
      chrome.proxy.settings.get({ incognito: false }, (config) => resolve(config));
    });
    await setCurrentAuthCredentials({ username, password });
    const testConfig = { mode: "pac_script", pacScript: { url: pacUrl } };
    await new Promise<void>((resolve, reject) => {
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
  } catch (error: any) {
    console.error("Proxy functionality test failed:", error.message);

    let errorMessage = `Proxy test failed: ${error.message}.`;
    if (error.message.includes('aborted')) {
      errorMessage = 'Proxy test timed out. The proxy server may be unreachable or slow.';
    } else {
      errorMessage += ' Please check the PAC script URL, server status, and your credentials.';
    }
    chrome.runtime.sendMessage({ type: "proxyError", message: errorMessage }); return false;

  } finally {
    await setCurrentAuthCredentials(originalAuthCredentials);
    if (originalProxySettings) {
      await new Promise<void>((resolve, reject) => {
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

export async function setProxyWithAuth(passedUrl: string, username?: string, password?: string) {
  // Always set credentials before enabling proxy
  await setCurrentAuthCredentials({ username, password });
  setProxy(passedUrl);
}
