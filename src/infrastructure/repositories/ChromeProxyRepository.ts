import { Server } from '../../domain/models/Server';
import { ProxyRepository } from '../../domain/repositories/ProxyRepository';

// Type definitions for chrome.proxy if not available globally
// These might need to be adjusted based on the actual chrome types package if you use one
declare global {
  namespace chrome {
    namespace runtime {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function sendMessage(message: any, callback?: (response: any) => void): void;
    }
    namespace proxy {
      namespace settings {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function get(details: object, callback: (details: { value: any }) => void): void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function set(details: { value: any, scope?: string }, callback?: () => void): void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function clear(details: { scope?: string }, callback?: () => void): void;
      }
    }
  }
}

export class ChromeProxyRepository implements ProxyRepository {
  async connect(server: Server): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`ChromeProxyRepository: Connecting to proxy: ${server.url}`);
      // The original code used chrome.runtime.sendMessage to a background script.
      // We replicate that logic here.
      // Assuming the background script listens for { action: 'setProxy', url: server.url }
      chrome.runtime.sendMessage({ action: 'setProxy', url: server.url }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('ChromeProxyRepository: Error connecting to proxy', chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log('ChromeProxyRepository: Connect message sent, response:', response);
          resolve();
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('ChromeProxyRepository: Disconnecting from proxy');
      // Assuming the background script listens for { action: 'setProxy', url: '' } to disconnect
      chrome.runtime.sendMessage({ action: 'setProxy', url: '' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('ChromeProxyRepository: Error disconnecting from proxy', chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log('ChromeProxyRepository: Disconnect message sent, response:', response);
          resolve();
        }
      });
    });
  }

  async getProxyStatus(): Promise<{ isActive: boolean }> {
    return new Promise((resolve) => {
      console.log('ChromeProxyRepository: Getting proxy status');
      chrome.proxy.settings.get({}, (details) => {
        if (chrome.runtime.lastError) {
          // Gracefully handle cases where proxy settings might not be available (e.g. incognito with no extension control)
          console.warn('ChromeProxyRepository: Could not get proxy settings, assuming disconnected.', chrome.runtime.lastError.message);
          resolve({ isActive: false });
          return;
        }
        // 'direct' mode means no proxy is active. Other modes ('fixed_servers', 'pac_script') mean a proxy is set.
        const isActive = details.value.mode !== 'direct';
        console.log('ChromeProxyRepository: Proxy status fetched', { isActive, mode: details.value.mode });
        resolve({ isActive });
      });
    });
  }
}
