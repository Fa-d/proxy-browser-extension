import { Server } from '../../domain/models/Server';
import { ProxyRepository } from '../../domain/repositories/ProxyRepository';

export class ChromeProxyRepository implements ProxyRepository {
  async connect(server: Server): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'setProxy', url: server.url }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'setProxy', url: '' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  async getProxyStatus(): Promise<{ isActive: boolean }> {
    return new Promise((resolve) => {
      if (!chrome.proxy || !chrome.proxy.settings || !chrome.proxy.settings.get) {
        resolve({ isActive: false });
        return;
      }
      chrome.proxy.settings.get({}, (details) => {
        if (chrome.runtime.lastError) {
          resolve({ isActive: false });
          return;
        }
        const isActive = details.value.mode !== 'direct';
        resolve({ isActive });
      });
    });
  }
}
