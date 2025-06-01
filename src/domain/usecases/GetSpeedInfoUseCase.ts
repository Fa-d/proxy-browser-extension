import { SpeedInfo } from '../models/SpeedInfo';

export interface GetSpeedInfoUseCase {
  // Gets the current speed info. Assumes monitoring is handled elsewhere or by repository itself.
  getCurrentSpeed(): Promise<SpeedInfo | null>;

  // Instructs the underlying repository to start monitoring a specific tab.
  startMonitoringForTab(tabId: number): void;

  // Instructs the underlying repository to stop all monitoring.
  stopMonitoringForAllTabs(): void;
}
