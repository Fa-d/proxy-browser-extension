import { Server } from '../../domain/models/Server';
import { ServerRepository } from '../../domain/repositories/ServerRepository';

const SELECTED_SERVER_STORAGE_KEY = 'selectedServer';

// This is the existing hardcoded list
const produvtList = [
    { url: "38.154.227.167:5868", country: "United States", city: "New York" },
    { url: "185.199.229.156:7492", country: "Spain", city: "Madrird" },
    { url: "185.199.228.220:7300", country: "Spain", city: "Las Rozas De Madrid" },
    { url: "185.199.231.45:8382", country: "Spain", city: "Madrid" },
    { url: "188.74.210.207:6286", country: "Italy", city: "Strada" },
    { url: "188.74.183.10:8279", country: "United States", city: "New York" },
    { url: "188.74.210.21:6100", country: "Italy", city: "Strada" },
    { url: "45.155.68.129:8133", country: "Italy", city: "Strada" },
    { url: "154.95.36.199:6893", country: "Netherlands", city: "Haarlem" },
    { url: "45.94.47.66:8110", country: "United States", city: "New York" },
];

export class HardcodedServerRepository implements ServerRepository {
  async getServers(): Promise<Server[]> {
    // Add a unique ID to each server, using the URL for simplicity here
    return produvtList.map(s => ({ ...s, id: s.url }));
  }

  async getSelectedServer(): Promise<Server | null> {
    const serverJson = localStorage.getItem(SELECTED_SERVER_STORAGE_KEY);
    if (serverJson) {
      try {
        const server: Server = JSON.parse(serverJson);
        return server;
      } catch (error) {
        console.error('HardcodedServerRepository: Error parsing selected server from localStorage', error);
        localStorage.removeItem(SELECTED_SERVER_STORAGE_KEY); // Clear corrupted data
        return null;
      }
    }
    return null;
  }

  async selectServer(server: Server): Promise<void> {
    localStorage.setItem(SELECTED_SERVER_STORAGE_KEY, JSON.stringify(server));
  }
}
