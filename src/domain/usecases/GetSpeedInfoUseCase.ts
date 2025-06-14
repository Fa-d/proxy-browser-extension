import { SpeedInfo } from '../models/SpeedInfo';

export interface GetSpeedInfoUseCase {
  getCurrentSpeed(): Promise<SpeedInfo | null>;

  startMonitoringForTab(tabId: number): void;

  stopMonitoringForAllTabs(): void;
}
