import { SpeedInfo } from '../../domain/models/SpeedInfo';
import { SpeedRepository } from '../../domain/repositories/SpeedRepository';
import { GetSpeedInfoUseCase } from '../../domain/usecases/GetSpeedInfoUseCase';
import { ChromeSpeedRepository } from '../../infrastructure/repositories/ChromeSpeedRepository'; 

export class SpeedService implements GetSpeedInfoUseCase {
  private speedRepository: SpeedRepository;

  constructor() {
    this.speedRepository = new ChromeSpeedRepository();
  }

  async getCurrentSpeed(): Promise<SpeedInfo | null> {
    return this.speedRepository.getCurrentSpeedInfo();
  }

  startMonitoringForTab(tabId: number): void {
    this.speedRepository.startMonitoring(tabId);
  }

  stopMonitoringForAllTabs(): void {
    this.speedRepository.stopMonitoring();
  }
}
