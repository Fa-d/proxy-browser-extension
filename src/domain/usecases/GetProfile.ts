import { User } from '../models/User';

export interface GetProfile {
  execute(): Promise<User | null>;
}
