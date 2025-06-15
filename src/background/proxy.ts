// src/background/proxy.ts
import { safeSendMessage } from '.';
import { showNotification } from './notifications';

let currentAuthCredentials: { username?: string; password?: string; } | null = null;

export function setCurrentAuthCredentials(creds: { username?: string; password?: string; } | null) {
    currentAuthCredentials = creds;
}

export function getCurrentAuthCredentials() {
    return currentAuthCredentials;
}

export function setProxy(passedUrl: string) {
    const config = {
        mode: "pac_script",
        pacScript: { url: passedUrl }
    };
    chrome.proxy.settings.set({ value: config, scope: "regular" }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error setting PAC script:", chrome.runtime.lastError.message);
            showNotification("Proxy Error", `Failed to set PAC script: ${chrome.runtime.lastError.message}`);
            safeSendMessage({ type: "proxyError", message: `Failed to set PAC script: ${chrome.runtime.lastError.message}` });
        } else {
            console.log(`PAC script enabled from: ${passedUrl}`);
            showNotification("Proxy Enabled", `Proxy set to: ${passedUrl}`);
            safeSendMessage({ type: "proxySuccess", message: `Proxy enabled: ${passedUrl}` });
        }
    });
}

export function clearProxy() {
    chrome.proxy.settings.clear({ scope: "regular" }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error clearing proxy:", chrome.runtime.lastError.message);
            showNotification("Proxy Error", `Failed to clear proxy: ${chrome.runtime.lastError.message}`);
            safeSendMessage({ type: "proxyError", message: `Failed to clear proxy: ${chrome.runtime.lastError.message}` });
        } else {
            console.log("Proxy cleared");
            showNotification("Proxy Cleared", "Disconnected from proxy server");
            safeSendMessage({ type: "proxySuccess", message: "Proxy cleared" });
        }
    });
}

export const authRequiredListener = function (details: chrome.webRequest.WebRequestDetails) {
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

export async function checkProxyFunctionality(pacUrl: string, username?: string, password?: string) {
    const testUrl = 'https://www.google.com/generate_204';
    let originalProxySettings: any = null;
    let originalAuthCredentials: { username?: string; password?: string; } | null = currentAuthCredentials ? { ...currentAuthCredentials } : null;
    try {
        originalProxySettings = await new Promise<any>((resolve) => {
            chrome.proxy.settings.get({ incognito: false }, (config) => resolve(config));
        });
        currentAuthCredentials = { username, password };
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
        showNotification("Proxy Test Failed", `Could not connect via proxy: ${error.message}. Check server and credentials.`);
        chrome.runtime.sendMessage({ type: "proxyError", message: `Proxy test failed: ${error.message}. Check server and credentials.` });
        return false;
    } finally {
        currentAuthCredentials = originalAuthCredentials;
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
