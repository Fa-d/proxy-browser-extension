import { Server } from '../models/Server';

export interface ProxyRepository {
  connect(server: Server): Promise<void>;
  disconnect(): Promise<void>;
  getProxyStatus(): Promise<{ isActive: boolean }>;
}
