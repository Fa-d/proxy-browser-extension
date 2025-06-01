import { ConnectionDetails } from '../models/ConnectionDetails';

export interface GetConnectionDetails {
  execute(): Promise<ConnectionDetails>;
}
