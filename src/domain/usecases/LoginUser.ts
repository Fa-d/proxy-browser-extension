import { User } from '../models/User';
import { AuthCredentials } from '../repositories/AuthRepository';

export interface LoginUser {
  execute(credentials: AuthCredentials): Promise<User | null>;
}
