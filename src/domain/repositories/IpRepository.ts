export interface IpRepository {
  getCurrentIp(): Promise<string>;
}
