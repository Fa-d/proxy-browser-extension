import { Server } from '../../domain/models/Server';
import { ServerRepository } from '../../domain/repositories/ServerRepository';
// import { HardcodedServerRepository } from '../../infrastructure/repositories/HardcodedServerRepository';
import { ApiServerRepository } from '../../infrastructure/repositories/ApiServerRepository';

export class ServerService {
  private serverRepository: ServerRepository;

  constructor() {
    this.serverRepository = new ApiServerRepository();
  }

  async getServers(): Promise<Server[]> {
    return this.serverRepository.getServers();
  }

  async getSelectedServer(): Promise<Server | null> {
    return this.serverRepository.getSelectedServer();
  }

  async selectServer(server: Server): Promise<void> {
    return this.serverRepository.selectServer(server);
  }
}
