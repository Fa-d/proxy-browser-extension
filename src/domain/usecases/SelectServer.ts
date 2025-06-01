import { Server } from '../models/Server';

export interface SelectServer {
  execute(server: Server): Promise<void>;
}
