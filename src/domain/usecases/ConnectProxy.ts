import { Server } from '../models/Server';

export interface ConnectProxy {
  execute(server: Server): Promise<void>;
}
