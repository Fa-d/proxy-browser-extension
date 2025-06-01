import { User } from '../models/User';

export interface AuthCredentials {
  email: string;
  password?: string; // Password might not always be needed (e.g. for auto-login)
}

export interface AuthRepository {
  login(credentials: AuthCredentials): Promise<User | null>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
