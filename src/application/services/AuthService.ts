import { User } from '../../domain/models/User';
import { AuthCredentials, AuthRepository, UserDetails } from '../../domain/repositories/AuthRepository';
import { LocalStorageAuthRepository } from '../../infrastructure/repositories/LocalStorageAuthRepository';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new LocalStorageAuthRepository();
  }

  async login(credentials: AuthCredentials): Promise<User | null> { 
    console.log('AuthService: login called');
    return this.authRepository.login(credentials);
  }

  async logout(): Promise<void> { 
    console.log('AuthService: logout called');
    return this.authRepository.logout();
  }

  async getProfile(): Promise<User | null> { 
    console.log('AuthService: getProfile called');
    return this.authRepository.getCurrentUser();
  }

  async getUserDetails(): Promise<UserDetails | null> {
    console.log('AuthService: getUserDetails called');
    if (typeof this.authRepository.getUserDetails === 'function') {
      return this.authRepository.getUserDetails();
    }
    console.warn('AuthService: authRepository does not implement getUserDetails');
    return null;
  }
}
