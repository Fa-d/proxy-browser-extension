import { User } from '../../domain/models/User';
import { AuthCredentials } from '../../domain/repositories/AuthRepository';

export class DummyAuthApi {
  async login(credentials: AuthCredentials): Promise<User | null> {
    console.log('DummyAuthApi: login called with', credentials);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (credentials.email === 'admin' && credentials.password === 'admin') {
      const user: User = {
        id: 'dummy-user-id-123',
        email: credentials.email,
      };
      console.log('DummyAuthApi: login successful', user);
      return user;
    }
    console.log('DummyAuthApi: login failed');
    return null;
  }

  async logout(): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('DummyAuthApi: logout successful');
    return;
  }

  async getCurrentUser(): Promise<User | null> {
    // This would typically involve checking a token or session with a backend
    // For this dummy API, we'll simulate it based on a flag or stored info
    // This part will be better handled by the AuthRepository using localStorage
    console.log('DummyAuthApi: getCurrentUser called');
    await new Promise(resolve => setTimeout(resolve, 100));
    // Simulate finding a user if they previously "logged in" via this dummy API context
    // This is a simplified mock, actual session management is more complex.
    // Returning null as the repository will manage the actual "logged in" state.
    return null;
  }
}
