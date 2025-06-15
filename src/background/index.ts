import { showNotification } from './notifications';
import { setProxy, clearProxy, authRequiredListener, checkProxyFunctionality, setCurrentAuthCredentials, getCurrentAuthCredentials } from './proxy';
import { registerTabDataListeners } from './tabData';
import { registerMessageHandler } from './messageHandler';

console.log('Background script loaded at', new Date().toISOString());

// Register listeners immediately
registerTabDataListeners();
registerMessageHandler();

console.log('All listeners registered. Ready to handle messages and proxy events.');
// Defensive utility for sending messages to background
export function safeSendMessage(message: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!chrome.runtime || !chrome.runtime.sendMessage) {
      console.error('chrome.runtime.sendMessage is not available. Background may not be ready.');
      reject(new Error('chrome.runtime.sendMessage is not available.'));
      return;
    }
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message to background:', chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log('Message sent to background:', message, 'Response:', response);
          resolve(response);
        }
      });
    } catch (err) {
      console.error('Exception in sendMessage:', err);
      reject(err);
    }
  });
}
// Guard: Ensure all proxy/auth logic only runs after listeners are registered

// Example PAC script pattern for documentation:
// function FindProxyForURL(url, host) {
//   if (shExpMatch(host, '*.example.com')) {
//     return 'PROXY proxy.example.com:443';
//   }
//   return 'DIRECT';
// }

