import { SpeedInfo } from '../../domain/models/SpeedInfo';
import { SpeedRepository } from '../../domain/repositories/SpeedRepository';
import { GetSpeedInfoUseCase } from '../../domain/usecases/GetSpeedInfoUseCase';
import { ChromeSpeedRepository } from '../../infrastructure/repositories/ChromeSpeedRepository'; // Concrete implementation

export class SpeedService implements GetSpeedInfoUseCase {
  private speedRepository: SpeedRepository;

  constructor() {
    // In a real app with DI, SpeedRepository would be injected.
    this.speedRepository = new ChromeSpeedRepository();
  }

  async getCurrentSpeed(): Promise<SpeedInfo | null> {
    // console.log("SpeedService: getCurrentSpeed called");
    return this.speedRepository.getCurrentSpeedInfo();
  }

  startMonitoringForTab(tabId: number): void {
    // console.log(`SpeedService: startMonitoringForTab called for tab ${tabId}`);
    this.speedRepository.startMonitoring(tabId);
  }

  stopMonitoringForAllTabs(): void {
    // console.log("SpeedService: stopMonitoringForAllTabs called");
    this.speedRepository.stopMonitoring();
  }
}
