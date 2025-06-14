import { IpRepository } from '../../domain/repositories/IpRepository';
import { IpifyApi } from '../api/IpifyApi';

export class RemoteIpRepository implements IpRepository {
  private ipifyApi: IpifyApi;

  constructor() {
    this.ipifyApi = new IpifyApi();
  }

  async getCurrentIp(): Promise<string> {
    try {
      const ip = await this.ipifyApi.fetchCurrentIp();
      return ip;
    } catch (error) {
      console.error('RemoteIpRepository: Error fetching IP', error);
      return "Error fetching IP";
    }
  }
}
