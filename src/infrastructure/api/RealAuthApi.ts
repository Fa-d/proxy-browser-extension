import { AuthCredentials, AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/models/User';

// Define interfaces for the actual API request and response structure
interface ApiLoginRequest {
  username: string;
  pass: string;
  udid: string;
  device_type: number;
}

// Define the structure of the items in ip_bundle
export interface IpBundleItem {
  ip: string;
  country_name: string;
  ip_id: number;
}

// Define the structure for the successful API response
export interface ApiLoginSuccessResponse {
  response_code: 1;
  message: string;
  ip_bundle: IpBundleItem[];
  package_name: string;
  expire_in_days: number;
  validity_date: string;
  expired_at: string;
  user_type: number;
  dedicated_server_validity_date: string;
  dedicated_server_status: number;
  show_banner: string;
  show_full_screen: string;
  user_status: string;
  account_id: number;
  fullname: string;
  is_social_login: number;
  contact_email: string;
  website_url: string;
  enable_promotional_banner: number;
  promotional_banner_details: {
    promotional_banner_image_url: string;
    promotional_banner_title: string;
    promotional_banner_button_text: string;
  };
  // Skipping in_app_payment_page_data for brevity unless needed for User model
  // anti_tracker: null; // Assuming these are not directly part of User or critical auth data
  // adult_content_blocker: null;
}

// Define the structure for the API error response
interface ApiLoginErrorResponse {
  status_code?: number; // Optional, as per example (404)
  response_code: number; // e.g., 3
  message: string;
  // Skipping in_app_payment_page_data for brevity
  should_show_support?: boolean;
  is_required_email_verified?: boolean;
}

// Define a richer response type for our RealAuthApi's login method
// This will be used by the repository that calls this API class
export interface RealAuthApiResponse {
  user: User;
  ipBundle: IpBundleItem[];
  packageName: string;
  validityDate: string;
  userType: number;
  fullName: string;
  // Add any other important fields that AuthService might need
}

export class RealAuthApi { // Implementing Partial as it focuses on login
  private readonly apiUrl = 'https://api.iplockvpn.com/app-api-v1/extension-login';

  // Hardcoded UDID and device_type as per issue description
  private readonly udid = '20b693e9134ee2ce';
  private readonly device_type = 5;

  async login(credentials: AuthCredentials): Promise<RealAuthApiResponse | null> {
    const requestBody: ApiLoginRequest = {
      username: credentials.email, // Mapping email to username
      pass: credentials.password || '', // API requires pass
      udid: this.udid,
      device_type: this.device_type,
    };

    if (!credentials.password) {
      // console.warn('RealAuthApi: Password is required for login.');
      // Or throw an error, or return null based on how AuthRepository expects this.
      // For now, let's proceed and let the API handle missing password if it can.
      // The issue description implies password is part of the request.
      // throw new Error('Password is required for login.');
      return null; // Or align with how DummyAuthApi handles missing pass
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData: ApiLoginSuccessResponse | ApiLoginErrorResponse = await response.json();

      if (response.ok && responseData.response_code === 1) {
        const successData = responseData as ApiLoginSuccessResponse;
        const user: User = {
          id: successData.account_id.toString(),
          email: credentials.email, // Use the email provided in credentials
        };
        return {
          user,
          ipBundle: successData.ip_bundle,
          packageName: successData.package_name,
          validityDate: successData.validity_date,
          userType: successData.user_type,
          fullName: successData.fullname,
          // map other fields as necessary
        };
      } else {
        const errorData = responseData as ApiLoginErrorResponse;
        console.error('RealAuthApi: Login failed:', errorData.message, responseData);
        // Depending on how errors should be propagated to UI,
        // you might throw a custom error here or return null.
        // Returning null for now to match User | null, but the calling repo needs to handle this.
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('RealAuthApi: Network or other error during login:', error);
      // Propagate the error or a generic one
      // throw error; // Rethrow the caught error
      throw new Error(error instanceof Error ? error.message : 'An unknown network error occurred');
    }
  }

  // logout and getCurrentUser are typically not handled by a pure API interaction class like this.
  // They would be managed by a repository that uses localStorage (e.g., LocalStorageAuthRepository).
  // Thus, we either don't implement them here or make them throw Not Implemented.
  // For Partial<AuthRepository>, this is fine.

  // async logout(): Promise<void> {
  //   throw new Error('Logout not implemented in RealAuthApi. Should be handled by LocalStorageAuthRepository.');
  // }

  // async getCurrentUser(): Promise<User | null> {
  //   throw new Error('getCurrentUser not implemented in RealAuthApi. Should be handled by LocalStorageAuthRepository.');
  // }
}
