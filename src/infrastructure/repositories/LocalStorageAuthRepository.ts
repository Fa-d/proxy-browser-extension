import { AuthCredentials, AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/models/User';
import { RealAuthApi, RealAuthApiResponse, IpBundleItem } from '../api/RealAuthApi';

// Define UserDetails interface for storing other user-specific data from RealAuthApiResponse
interface UserDetails {
  packageName: string;
  validityDate: string;
  userType: number;
  fullName: string;
}

const USER_STORAGE_KEY = 'currentUser'; // already exists
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
      // This case handles where RealAuthApi.login might return null (e.g., no password)
      // before an error is thrown.
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
        console.error('LocalStorageAuthRepository: Error parsing core user data from localStorage', error);
        this.clearAllAuthData();
        return null;
      }
    }
    return null;
  }

  async getIpBundle(): Promise<IpBundleItem[] | null> {
    const bundleJson = localStorage.getItem(IP_BUNDLE_STORAGE_KEY);
    if (bundleJson) {
      try {
        return JSON.parse(bundleJson) as IpBundleItem[];
      } catch (error) {
        console.error('LocalStorageAuthRepository: Error parsing IP bundle from localStorage', error);
        localStorage.removeItem(IP_BUNDLE_STORAGE_KEY); // Clear corrupted data
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
        console.error('LocalStorageAuthRepository: Error parsing user details from localStorage', error);
        localStorage.removeItem(USER_DETAILS_STORAGE_KEY); // Clear corrupted data
        return null;
      }
    }
    return null;
  }
}
