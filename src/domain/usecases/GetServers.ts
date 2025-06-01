import { Server } from '../models/Server';

export interface GetServers {
  execute(): Promise<Server[]>;
}
