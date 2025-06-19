import { Server } from '../../domain/models/Server';
import { ProxyRepository } from '../../domain/repositories/ProxyRepository';

function isReceivingEndError(err: any): boolean {
  return (
    err &&
    typeof err.message === 'string' &&
    err.message.includes('Could not establish connection. Receiving end does not exist.')
  );
}

async function sendMessageWithRetry(message: any, retries = 1, delayMs = 300): Promise<any> {
  return new Promise((resolve, reject) => {
    function attempt(remaining: number) {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          if (
            isReceivingEndError(chrome.runtime.lastError) &&
            remaining > 0
          ) {
            setTimeout(() => attempt(remaining - 1), delayMs);
            return;
          }
          reject(
            new Error(
              isReceivingEndError(chrome.runtime.lastError)
                ? 'Background service is not ready. Please try again.'
                : chrome.runtime.lastError.message
            )
          );
        } else {
          resolve(response);
        }
      });
    }
    attempt(retries);
  });
}

export class ChromeProxyRepository implements ProxyRepository {
  async connect(server: Server): Promise<void> {
    await sendMessageWithRetry({ action: 'setProxy', url: server.url, username: "admin", password: "123456" }, 1, 300).catch((error) => {
      this.disconnect();
      console.error('Error connecting to proxy:', error);
      throw error;
    });
  }

  async disconnect(): Promise<void> {
    await sendMessageWithRetry({ action: 'setProxy', url: '' }, 1, 300);
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
        const isActive = details.value.mode === 'fixed_servers';
        resolve({ isActive: isActive });
      });
    });
  }
}
