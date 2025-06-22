import { Server } from '../../domain/models/Server';
import { ServerRepository } from '../../domain/repositories/ServerRepository';
import { IpBundleItem } from '../api/RealAuthApi';

const IP_BUNDLE_STORAGE_KEY = 'ipBundle'; 
const SELECTED_SERVER_STORAGE_KEY = 'selectedServer';

export class ApiServerRepository implements ServerRepository {

  async getServers(): Promise<Server[]> {
    const ipBundleJson = localStorage.getItem(IP_BUNDLE_STORAGE_KEY);
    if (!ipBundleJson) {
      return [];
    }

    try {
      const ipBundle = JSON.parse(ipBundleJson) as IpBundleItem[];
      if (!Array.isArray(ipBundle)) {
        console.error('ApiServerRepository: Parsed IP bundle is not an array. Clearing corrupted data.');
        localStorage.removeItem(IP_BUNDLE_STORAGE_KEY);
        return [];
      }

      chrome.enterprise
      const servers: Server[] = ipBundle.map(item => ({
        id: item.ip_id.toString(),
        url: item.ip,
        country: item.country_name,
        city: item.city,
        countryCode: item.country_code
      }));
      return servers;
    } catch (error) {
      console.error('ApiServerRepository: Error parsing IP bundle from localStorage. Clearing corrupted data.', error);
      localStorage.removeItem(IP_BUNDLE_STORAGE_KEY);
      return [];
    }
  }

  async getSelectedServer(): Promise<Server | null> {
    const serverJson = localStorage.getItem(SELECTED_SERVER_STORAGE_KEY);
    if (serverJson) {
      try {
        return JSON.parse(serverJson) as Server;
      } catch (error) {
        console.error('ApiServerRepository: Error parsing selected server from localStorage. Clearing corrupted data.', error);
        localStorage.removeItem(SELECTED_SERVER_STORAGE_KEY);
        return null;
      }
    }
    return null;
  }

  async selectServer(server: Server): Promise<void> {
    if (server) {
      localStorage.setItem(SELECTED_SERVER_STORAGE_KEY, JSON.stringify(server));
    } else {
      localStorage.removeItem(SELECTED_SERVER_STORAGE_KEY);
    }
  }
}
