// src/background/messageHandler.ts
import { setProxy, clearProxy, authRequiredListener, checkProxyFunctionality, setCurrentAuthCredentials, setProxyWithAuth } from './proxy';

export function registerMessageHandler() {
    chrome.runtime.onMessage.addListener(async (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
        try {
            if (request.action === 'setProxy') {
                if (chrome.webRequest.onAuthRequired.hasListener(authRequiredListener)) {
                    chrome.webRequest.onAuthRequired.removeListener(authRequiredListener);
                }
                chrome.webRequest.onAuthRequired.addListener(
                    // authRequiredListener,
                    function (details) {
                        return {
                            authCredentials: {
                                username: "admin",
                                password: "123456"
                            }
                        };
                    },
                    { urls: ["<all_urls>"] },
                    ['blocking']
                );
                if (request.url === "" || request.url == undefined) {
                    setCurrentAuthCredentials({ username: "", password: "" });
                    clearProxy();
                    sendResponse({ status: "Proxy cleared" });
                } else {
                    const isFunctional = await checkProxyFunctionality(request.url, request.username, request.password);
                    if (isFunctional) {
                        console.log("Proxy test successful. Setting proxy permanently...");
                        await setProxyWithAuth(request.url, request.username, request.password);
                        sendResponse({ status: "Proxy set", url: request.url });
                    } else {
                        console.log("Proxy test failed. Not setting proxy.");
                        sendResponse({ status: "Proxy test failed" });
                    }
                }
            } else {
                console.warn("Unknown action:", request.action, request.status);
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

}
