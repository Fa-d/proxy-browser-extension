import { User } from '../../domain/models/User';
import { AuthCredentials, AuthRepository } from '../../domain/repositories/AuthRepository';
// No longer "implements LoginUser, LogoutUser, GetProfile" to avoid 'execute' signature issues
// The hooks will call the specific methods like login, logout, getProfile.
// import { LoginUser } from '../../domain/usecases/LoginUser';
// import { LogoutUser } from '../../domain/usecases/LogoutUser';
// import { GetProfile } from '../../domain/usecases/GetProfile';
import { LocalStorageAuthRepository } from '../../infrastructure/repositories/LocalStorageAuthRepository';

export class AuthService { // Removed "implements LoginUser, LogoutUser, GetProfile"
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new LocalStorageAuthRepository();
  }

  async login(credentials: AuthCredentials): Promise<User | null> { // Renamed from executeLogin for clarity
    console.log('AuthService: login called');
    return this.authRepository.login(credentials);
  }

  async logout(): Promise<void> { // Renamed from executeLogout
    console.log('AuthService: logout called');
    return this.authRepository.logout();
  }

  async getProfile(): Promise<User | null> { // Renamed from executeGetProfile
    console.log('AuthService: getProfile called');
    return this.authRepository.getCurrentUser();
  }

  // Removed the problematic generic 'execute' method
}
