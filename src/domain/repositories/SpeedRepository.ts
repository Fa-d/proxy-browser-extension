import { SpeedInfo } from '../models/SpeedInfo';

export interface SpeedRepository {
  // Starts monitoring speed for a specific tabId.
  // The repository will internally handle polling for this tab.
  startMonitoring(tabId: number): void;

  // Stops monitoring speed (e.g., clears polling intervals).
  stopMonitoring(): void;

  // Retrieves the latest calculated speed information.
  // This method itself might not be async if the repository continuously updates
  // an internal state that this method simply returns.
  // However, making it async provides flexibility for implementations that might
  // need to fetch on demand or do a quick check.
  // For a polling repository, this could return the latest polled value synchronously,
  // but an async signature is safer for interface consistency.
  // Let's make it return SpeedInfo | null, where null means data isn't available yet.
  getCurrentSpeedInfo(): Promise<SpeedInfo | null>;
}
