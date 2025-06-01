import { User } from '../../domain/models/User';
import { AuthCredentials, AuthRepository } from '../../domain/repositories/AuthRepository';
import { DummyAuthApi } from '../api/DummyAuthApi';

const USER_STORAGE_KEY = 'currentUser';

export class LocalStorageAuthRepository implements AuthRepository {
  private dummyApi: DummyAuthApi;

  constructor() {
    this.dummyApi = new DummyAuthApi(); // In a real app, this might be injected
  }

  async login(credentials: AuthCredentials): Promise<User | null> {
    const user = await this.dummyApi.login(credentials);
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    }
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }

  async logout(): Promise<void> {
    // Call the dummy API logout, though it doesn't do much for local storage
    await this.dummyApi.logout();
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (userJson) {
      try {
        const user: User = JSON.parse(userJson);
        return user;
      } catch (error) {
        console.error('LocalStorageAuthRepository: Error parsing user from localStorage', error);
        localStorage.removeItem(USER_STORAGE_KEY); // Clear corrupted data
        return null;
      }
    }
    return null;
  }
}
