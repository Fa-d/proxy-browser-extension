import { Server } from '../../domain/models/Server';
import { ConnectionDetails } from '../../domain/models/ConnectionDetails';
import { ProxyRepository } from '../../domain/repositories/ProxyRepository';
import { IpRepository } from '../../domain/repositories/IpRepository';
import { ConnectProxy } from '../../domain/usecases/ConnectProxy';
import { DisconnectProxy } from '../../domain/usecases/DisconnectProxy';
import { GetConnectionDetails } from '../../domain/usecases/GetConnectionDetails';
import { ChromeProxyRepository } from '../../infrastructure/repositories/ChromeProxyRepository';
import { RemoteIpRepository } from '../../infrastructure/repositories/RemoteIpRepository';
import { ServerRepository } from '../../domain/repositories/ServerRepository';
import { HardcodedServerRepository } from '../../infrastructure/repositories/HardcodedServerRepository';


export class ProxyService implements ConnectProxy, DisconnectProxy, GetConnectionDetails {
  private proxyRepository: ProxyRepository;
  private ipRepository: IpRepository;
  private serverRepository: ServerRepository; // Needed to get selected server details for display

  constructor() {
    // Direct instantiation, replace with DI in larger apps
    this.proxyRepository = new ChromeProxyRepository();
    this.ipRepository = new RemoteIpRepository();
    this.serverRepository = new HardcodedServerRepository();
  }

  async executeConnect(server: Server): Promise<void> {
    console.log('ProxyService: executeConnect called for server', server.url);
    await this.proxyRepository.connect(server);
  }

  async executeDisconnect(): Promise<void> {
    console.log('ProxyService: executeDisconnect called');
    await this.proxyRepository.disconnect();
  }

  async executeGetConnectionDetails(): Promise<ConnectionDetails> {
    console.log('ProxyService: executeGetConnectionDetails called');
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

  // To satisfy interface contracts if needed for GetConnectionDetails, ConnectProxy, DisconnectProxy:
  async execute(serverOrAction?: Server | 'disconnect' | 'getConnectionDetails'): Promise<ConnectionDetails | void> {
    if (serverOrAction === 'disconnect') {
      return this.executeDisconnect();
    } else if (serverOrAction === 'getConnectionDetails' || serverOrAction === undefined) {
      // Assuming undefined means get connection details
      return this.executeGetConnectionDetails();
    } else if (typeof serverOrAction === 'object') {
      return this.executeConnect(serverOrAction as Server);
    }
    throw new Error('ProxyService: Invalid operation');
  }
}
