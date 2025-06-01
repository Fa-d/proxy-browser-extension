import { Server } from '../../domain/models/Server';
import { ServerRepository } from '../../domain/repositories/ServerRepository';
import { HardcodedServerRepository } from '../../infrastructure/repositories/HardcodedServerRepository';

export class ServerService { // Removed "implements GetServers, GetSelectedServer, SelectServer"
  private serverRepository: ServerRepository;

  constructor() {
    this.serverRepository = new HardcodedServerRepository();
  }

  async getServers(): Promise<Server[]> { // Renamed from executeGetServers
    console.log('ServerService: getServers called');
    return this.serverRepository.getServers();
  }

  async getSelectedServer(): Promise<Server | null> { // Renamed from executeGetSelectedServer
    console.log('ServerService: getSelectedServer called');
    return this.serverRepository.getSelectedServer();
  }

  async selectServer(server: Server): Promise<void> { // Renamed from executeSelectServer
    console.log('ServerService: selectServer called for server', server.url);
    return this.serverRepository.selectServer(server);
  }
  // Removed the problematic generic 'execute' method
}
