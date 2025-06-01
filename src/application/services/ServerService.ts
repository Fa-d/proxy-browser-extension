import { Server } from '../../domain/models/Server';
import { ServerRepository } from '../../domain/repositories/ServerRepository';
import { GetServers } from '../../domain/usecases/GetServers';
import { GetSelectedServer } from '../../domain/usecases/GetSelectedServer';
import { SelectServer } from '../../domain/usecases/SelectServer';
import { HardcodedServerRepository } from '../../infrastructure/repositories/HardcodedServerRepository';

export class ServerService implements GetServers, GetSelectedServer, SelectServer {
  private serverRepository: ServerRepository;

  constructor() {
    // Direct instantiation, replace with DI in larger apps
    this.serverRepository = new HardcodedServerRepository();
  }

  async executeGetServers(): Promise<Server[]> {
    console.log('ServerService: executeGetServers called');
    return this.serverRepository.getServers();
  }

  async executeGetSelectedServer(): Promise<Server | null> {
    console.log('ServerService: executeGetSelectedServer called');
    return this.serverRepository.getSelectedServer();
  }

  async executeSelectServer(server: Server): Promise<void> {
    console.log('ServerService: executeSelectServer called for server', server.url);
    return this.serverRepository.selectServer(server);
  }

  // To satisfy interface contracts if needed:
  async execute(server?: Server): Promise<Server[] | Server | null | void> {
    if (server === undefined && arguments.length === 0) { // Bit of a hack to differentiate calls
        return this.executeGetServers();
    } else if (server === undefined && arguments.length === 1) { // Assuming this means getSelectedServer
         return this.executeGetSelectedServer();
    } else if (server) {
        return this.executeSelectServer(server);
    }
    throw new Error('ServerService: Invalid operation');
  }
}
