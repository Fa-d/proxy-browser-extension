import { Server } from '../../domain/models/Server';
import { ConnectionDetails } from '../../domain/models/ConnectionDetails';
import { ProxyRepository } from '../../domain/repositories/ProxyRepository';
import { IpRepository } from '../../domain/repositories/IpRepository';
import { ChromeProxyRepository } from '../../infrastructure/repositories/ChromeProxyRepository';
import { RemoteIpRepository } from '../../infrastructure/repositories/RemoteIpRepository';
import { ServerRepository } from '../../domain/repositories/ServerRepository';
import { ApiServerRepository } from '../../infrastructure/repositories/ApiServerRepository';

export class ProxyService {
  private proxyRepository: ProxyRepository;
  private ipRepository: IpRepository;
  private serverRepository: ServerRepository;

  constructor() {
    this.proxyRepository = new ChromeProxyRepository();
    this.ipRepository = new RemoteIpRepository();
    this.serverRepository = new ApiServerRepository();
  }

  async connect(server: Server): Promise<void> {
    console.log('ProxyService: connect called for server', server.url);
    await this.proxyRepository.connect(server);
  }

  async disconnect(): Promise<void> {
    console.log('ProxyService: disconnect called');
    await this.proxyRepository.disconnect();
  }

  async getConnectionDetails(): Promise<ConnectionDetails> {
    console.log('ProxyService: getConnectionDetails called');
    const status = await this.proxyRepository.getProxyStatus();
    const ip = await this.ipRepository.getCurrentIp();
    let selectedServerUrl: string | undefined = undefined;

    if (status.isActive) {
      const selectedServer = await this.serverRepository.getSelectedServer();
      selectedServerUrl = selectedServer?.url;
    }

    return {
      isConnected: status.isActive,
      currentIp: ip,
      selectedServerUrl: selectedServerUrl
    };
  }
}
