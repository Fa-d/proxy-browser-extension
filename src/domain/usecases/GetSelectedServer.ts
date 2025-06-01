import { Server } from '../models/Server';

export interface GetSelectedServer {
  execute(): Promise<Server | null>;
}
