import { AuthCredentials, AuthRepository, UserDetails } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/models/User';
import { RealAuthApi } from '../api/RealAuthApi';

const USER_STORAGE_KEY = 'currentUser';
const IP_BUNDLE_STORAGE_KEY = 'ipBundle';
const USER_DETAILS_STORAGE_KEY = 'userDetails';

export class LocalStorageAuthRepository implements AuthRepository {
  private realAuthApi: RealAuthApi;

  constructor() {
    this.realAuthApi = new RealAuthApi();
  }

  private clearAllAuthData(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(IP_BUNDLE_STORAGE_KEY);
    localStorage.removeItem(USER_DETAILS_STORAGE_KEY);
  }

  async login(credentials: AuthCredentials): Promise<User | null> {
    try {
      const apiResponse = await this.realAuthApi.login(credentials);

      if (apiResponse) {
        const { user, ipBundle, ...restDetails } = apiResponse;

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(IP_BUNDLE_STORAGE_KEY, JSON.stringify(ipBundle));

        const userDetailsData: UserDetails = {
          packageName: restDetails.packageName,
          validityDate: restDetails.validityDate,
          userType: restDetails.userType,
          fullName: restDetails.fullName,
        };
        localStorage.setItem(USER_DETAILS_STORAGE_KEY, JSON.stringify(userDetailsData));

        return user;
      }

      this.clearAllAuthData();
      return null;
    } catch (error) {
      console.error('LocalStorageAuthRepository: Login process failed', error);
      this.clearAllAuthData();
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.clearAllAuthData();
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch (error) {
        this.clearAllAuthData();
        return null;
      }
    }
    return null;
  }

  async getUserDetails(): Promise<UserDetails | null> {
    const detailsJson = localStorage.getItem(USER_DETAILS_STORAGE_KEY);
    if (detailsJson) {
      try {
        return JSON.parse(detailsJson) as UserDetails;
      } catch (error) {
        localStorage.removeItem(USER_DETAILS_STORAGE_KEY);
        return null;
      }
    }
    return null;
  }
}
