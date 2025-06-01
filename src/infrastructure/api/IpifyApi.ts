export class IpifyApi {
  private baseUrl = 'https://api.sanweb.info/myip/';

  async fetchCurrentIp(): Promise<string> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        console.error('IpifyApi: Failed to fetch IP, status:', response.status);
        throw new Error('Failed to fetch IP');
      }
      const data = await response.json();
      if (data && data.ip) {
        console.log('IpifyApi: IP fetched successfully', data.ip);
        return data.ip;
      } else {
        console.error('IpifyApi: IP data is not in expected format', data);
        throw new Error('IP data is not in expected format');
      }
    } catch (error) {
      console.error('IpifyApi: Error fetching IP', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }
}
