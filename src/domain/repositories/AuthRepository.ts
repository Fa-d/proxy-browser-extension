import { User } from '../models/User';

export interface AuthCredentials {
  email: string;
  password?: string; // Password might not always be needed (e.g. for auto-login)
}

// UserDetails interface (ensure it's defined here or imported if from a central types file)
export interface UserDetails {
  packageName: string;
  validityDate: string;
  userType: number;
  fullName: string;
}

export interface AuthRepository {
  login(credentials: AuthCredentials): Promise<User | null>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getUserDetails(): Promise<UserDetails | null>;
}
