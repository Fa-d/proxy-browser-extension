import { User } from '../../domain/models/User';
import { AuthCredentials, AuthRepository } from '../../domain/repositories/AuthRepository';
import { LoginUser } from '../../domain/usecases/LoginUser';
import { LogoutUser } from '../../domain/usecases/LogoutUser';
import { GetProfile } from '../../domain/usecases/GetProfile';
// Import concrete repository (in a real DI setup, this would be injected)
import { LocalStorageAuthRepository } from '../../infrastructure/repositories/LocalStorageAuthRepository';

export class AuthService implements LoginUser, LogoutUser, GetProfile {
  private authRepository: AuthRepository;

  constructor() {
    // In a more complex app, use dependency injection to provide the repository.
    // For now, we instantiate it directly.
    this.authRepository = new LocalStorageAuthRepository();
  }

  async executeLogin(credentials: AuthCredentials): Promise<User | null> {
    console.log('AuthService: executeLogin called');
    return this.authRepository.login(credentials);
  }

  async executeLogout(): Promise<void> {
    console.log('AuthService: executeLogout called');
    return this.authRepository.logout();
  }

  async executeGetProfile(): Promise<User | null> {
    console.log('AuthService: executeGetProfile called');
    return this.authRepository.getCurrentUser();
  }

  // Alias methods to match use case interface names if preferred
  // (or structure the class to directly implement those interfaces if multi-inheritance was possible like in some languages)
  // For simplicity, we'll call these specific methods from the presentation layer.
  // If you want to strictly adhere to `execute` name for all, you might need separate classes per use case.

  // Example of direct implementation of one use case for clarity:
  async execute(credentialsOrAction: AuthCredentials | 'logout' | 'getProfile'): Promise<User | null | void> {
    if (typeof credentialsOrAction === 'string') {
      if (credentialsOrAction === 'logout') {
        return this.executeLogout();
      }
      if (credentialsOrAction === 'getProfile') {
        return this.executeGetProfile();
      }
    } else if (typeof credentialsOrAction === 'object') {
      // It's login credentials
      return this.executeLogin(credentialsOrAction as AuthCredentials);
    }
    throw new Error('AuthService: Invalid action or credentials');
  }
}
