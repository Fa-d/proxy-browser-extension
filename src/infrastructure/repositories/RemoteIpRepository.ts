import { IpRepository } from '../../domain/repositories/IpRepository';
import { IpifyApi } from '../api/IpifyApi';

export class RemoteIpRepository implements IpRepository {
  private ipifyApi: IpifyApi;

  constructor() {
    this.ipifyApi = new IpifyApi(); // In a real app, this might be injected
  }

  async getCurrentIp(): Promise<string> {
    try {
      const ip = await this.ipifyApi.fetchCurrentIp();
      return ip;
    } catch (error) {
      // Depending on requirements, you might return a default/error value or rethrow
      // For now, rethrowing to let the use case/presenter decide.
      console.error('RemoteIpRepository: Error fetching IP', error);
      // Return a placeholder or throw, based on how you want to handle this in the UI
      return "Error fetching IP";
    }
  }
}
