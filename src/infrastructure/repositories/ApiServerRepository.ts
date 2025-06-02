import { Server } from '../../domain/models/Server';
import { ServerRepository } from '../../domain/repositories/ServerRepository';
import { IpBundleItem } from '../api/RealAuthApi'; // Assuming RealAuthApi exports this

const IP_BUNDLE_STORAGE_KEY = 'ipBundle'; // Must match key used in LocalStorageAuthRepository
const SELECTED_SERVER_STORAGE_KEY = 'selectedServer';

export class ApiServerRepository implements ServerRepository {

  constructor() {
    // Check if IpBundleItem is available, if not, define a local version.
    // This is just a type check for development, actual import should work.
    // type LocalIpBundleItem = { ip: string; country_name: string; ip_id: number; };
    // const temp: LocalIpBundleItem | undefined = undefined;
  }

  async getServers(): Promise<Server[]> {
    const ipBundleJson = localStorage.getItem(IP_BUNDLE_STORAGE_KEY);
    if (!ipBundleJson) {
      console.log('ApiServerRepository: No IP bundle found in localStorage.');
      return []; // No bundle means no servers
    }

    try {
      const ipBundle = JSON.parse(ipBundleJson) as IpBundleItem[];
      if (!Array.isArray(ipBundle)) {
        console.error('ApiServerRepository: Parsed IP bundle is not an array.');
        localStorage.removeItem(IP_BUNDLE_STORAGE_KEY); // Clear corrupted data
        return [];
      }

      const servers: Server[] = ipBundle.map(item => ({
        id: item.ip_id.toString(),
        url: item.ip, // e.g., "64.225.65.239:51820"
        country: item.country_name,
        city: '', // City is not available in IpBundleItem, defaulting to empty
      }));
      // console.log('ApiServerRepository: Fetched servers', servers);
      return servers;
    } catch (error) {
      console.error('ApiServerRepository: Error parsing IP bundle from localStorage', error);
      localStorage.removeItem(IP_BUNDLE_STORAGE_KEY); // Clear corrupted data
      return [];
    }
  }

  async getSelectedServer(): Promise<Server | null> {
    const serverJson = localStorage.getItem(SELECTED_SERVER_STORAGE_KEY);
    if (serverJson) {
      try {
        const server: Server = JSON.parse(serverJson);
        // console.log('ApiServerRepository: Fetched selected server', server);
        return server;
      } catch (error) {
        console.error('ApiServerRepository: Error parsing selected server from localStorage', error);
        localStorage.removeItem(SELECTED_SERVER_STORAGE_KEY); // Clear corrupted data
        return null;
      }
    }
    // console.log('ApiServerRepository: No selected server found in localStorage.');
    return null;
  }

  async selectServer(server: Server): Promise<void> {
    if (server) {
      localStorage.setItem(SELECTED_SERVER_STORAGE_KEY, JSON.stringify(server));
      // console.log('ApiServerRepository: Server selected and stored', server);
    } else {
      // console.warn('ApiServerRepository: Attempted to select a null server.');
      localStorage.removeItem(SELECTED_SERVER_STORAGE_KEY); // Clear if null is passed
    }
  }
}
