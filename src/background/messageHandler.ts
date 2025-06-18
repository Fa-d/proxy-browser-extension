// src/background/messageHandler.ts
import { setProxy, clearProxy, authRequiredListener, checkProxyFunctionality, setCurrentAuthCredentials } from './proxy';

export function registerMessageHandler() {
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
                    setCurrentAuthCredentials({ username: "", password: "" });
                    clearProxy();
                    sendResponse({ status: "Proxy cleared" });
                } else {
                    const isFunctional = await checkProxyFunctionality(request.url, request.username, request.password);
                    if (isFunctional) {
                        console.log("Proxy test successful. Setting proxy permanently...");
                        setCurrentAuthCredentials({ username: request.username, password: request.password });
                        setProxy(request.url);
                        sendResponse({ status: "Proxy set", url: request.url });
                    } else {
                        console.log("Proxy test failed. Not setting proxy.");
                        sendResponse({ status: "Proxy test failed" });
                    }
                }
            }else{
                console.warn("Unknown action:", request.action , request.status);
            }
        } catch (e: any) {
            console.error("Error in onMessage listener:", e);
            if (sendResponse) {
                try {
                    sendResponse({ status: "error", message: e.message });
                } catch (sendError: any) {
                    console.error("Error sending error response:", sendError);
                }
            }
        }
        return true;
    });

    chrome.runtime.onConnect.addListener((port) => {
        port.onMessage.addListener(async (request) => {
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
                    if (!request.url) {
                        setCurrentAuthCredentials({ username: '', password: '' });
                        clearProxy();
                        port.postMessage({ status: 'Proxy cleared' });
                    } else {
                        const isFunctional = await checkProxyFunctionality(request.url, request.username, request.password);
                        if (isFunctional) {
                            setCurrentAuthCredentials({ username: request.username, password: request.password });
                            setProxy(request.url);
                            port.postMessage({ status: 'Proxy set', url: request.url });
                        } else {
                            port.postMessage({ status: 'Proxy test failed' });
                        }
                    }
                } else {
                    port.postMessage({ status: 'Unknown action', action: request.action });
                }
            } catch (e: any) {
                port.postMessage({ status: 'error', message: e.message });
            }
        });
    });
}
