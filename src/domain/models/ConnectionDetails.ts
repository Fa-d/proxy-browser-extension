export interface ConnectionDetails {
  currentIp: string;
  isConnected: boolean;
  selectedServerUrl?: string; // Optional, as a server might not be selected
}
