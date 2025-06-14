import { SpeedInfo } from '../models/SpeedInfo';

export interface SpeedRepository {
  startMonitoring(tabId: number): void;

  stopMonitoring(): void;

  getCurrentSpeedInfo(): Promise<SpeedInfo | null>;
}
