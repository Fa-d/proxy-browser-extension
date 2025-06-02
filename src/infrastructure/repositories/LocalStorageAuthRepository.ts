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

        // Store the main user object (id, email)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

        // Store IP Bundle
        localStorage.setItem(IP_BUNDLE_STORAGE_KEY, JSON.stringify(ipBundle));

        // Store other user details
        const userDetails: UserDetails = {
          packageName: restDetails.packageName,
          validityDate: restDetails.validityDate,
          userType: restDetails.userType,
          fullName: restDetails.fullName,
        };
        localStorage.setItem(USER_DETAILS_STORAGE_KEY, JSON.stringify(userDetails));

        return user; // Return only the User object as per AuthRepository interface
      }
      // If apiResponse is null (e.g. password not provided in RealAuthApi)
      // or if RealAuthApi.login itself returned null before throwing an error
      this.clearAllAuthData(); // Ensure a clean state if login didn't fully complete
      return null;
    } catch (error) {
      console.error('LocalStorageAuthRepository: Login failed', error);
      this.clearAllAuthData(); // Clear any partial data on error
      throw error; // Re-throw the error to be handled by AuthService/useAuth
    }
  }

  async logout(): Promise<void> {
    this.clearAllAuthData();
    // console.log('LocalStorageAuthRepository: User data cleared from localStorage.');
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch (error) {
        console.error('LocalStorageAuthRepository: Error parsing user data from localStorage', error);
        this.clearAllAuthData(); // Clear all auth data if core user data is corrupt
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
