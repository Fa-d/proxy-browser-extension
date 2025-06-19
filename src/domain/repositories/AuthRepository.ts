import { User } from '../models/User';

export interface AuthCredentials {
  email: string;
  password?: string;
}

export interface UserDetails {
  packageName: string;
  validityDate: string;
  userType: number;
  userStatus: number;
  fullName: string;
}

export interface AuthRepository {
  login(credentials: AuthCredentials): Promise<User | null>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getUserDetails(): Promise<UserDetails | null>;
}
