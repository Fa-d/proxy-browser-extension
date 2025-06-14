import { User } from '../../domain/models/User';
import { AuthCredentials, AuthRepository, UserDetails } from '../../domain/repositories/AuthRepository';
import { LocalStorageAuthRepository } from '../../infrastructure/repositories/LocalStorageAuthRepository';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new LocalStorageAuthRepository();
  }

  async login(credentials: AuthCredentials): Promise<User | null> { 
    return this.authRepository.login(credentials);
  }

  async logout(): Promise<void> { 
    return this.authRepository.logout();
  }

  async getProfile(): Promise<User | null> { 
    return this.authRepository.getCurrentUser();
  }

  async getUserDetails(): Promise<UserDetails | null> {
    if (typeof this.authRepository.getUserDetails === 'function') {
      return this.authRepository.getUserDetails();
    }
    return null;
  }
}
