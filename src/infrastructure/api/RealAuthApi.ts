import { AuthCredentials } from '../../domain/repositories/AuthRepository';
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

}

interface ApiLoginErrorResponse {
  status_code?: number;
  response_code: number; 
  message: string;
  should_show_support?: boolean;
  is_required_email_verified?: boolean;
}


export interface RealAuthApiResponse {
  user: User;
  ipBundle: IpBundleItem[];
  packageName: string;
  validityDate: string;
  userType: number;
  fullName: string;
}

export class RealAuthApi {
  private readonly apiUrl = 'https://api.iplockvpn.com/app-api-v1/extension-login';
  private readonly udid = '20b693e9134ee2ce';
  private readonly device_type = 5;

  async login(credentials: AuthCredentials): Promise<RealAuthApiResponse | null> {
    const requestBody: ApiLoginRequest = {
      username: credentials.email, 
      pass: credentials.password || '',
      udid: this.udid,
      device_type: this.device_type,
    };

    if (!credentials.password) {
      return null;
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
          email: credentials.email, 
        };
        return {
          user,
          ipBundle: successData.ip_bundle,
          packageName: successData.package_name,
          validityDate: successData.validity_date,
          userType: successData.user_type,
          fullName: successData.fullname,
        };
      } else {
        const errorData = responseData as ApiLoginErrorResponse;
        console.error('RealAuthApi: Login API request failed:', errorData.message, responseData);
        throw new Error(errorData.message || 'Login failed due to API error');
      }
    } catch (error) {
      console.error('RealAuthApi: Network or fetch error during login:', error);
      throw new Error(error instanceof Error ? error.message : 'A network error occurred during login');
    }
  }
}
