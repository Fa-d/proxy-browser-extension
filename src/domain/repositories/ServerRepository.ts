import { Server } from '../models/Server';

export interface ServerRepository {
  getServers(): Promise<Server[]>;
  getSelectedServer(): Promise<Server | null>;
  selectServer(server: Server): Promise<void>;
}
