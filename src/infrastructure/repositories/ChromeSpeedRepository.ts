import { SpeedInfo } from '../../domain/models/SpeedInfo';
import { SpeedRepository } from '../../domain/repositories/SpeedRepository';

interface TabSpeedData {
  totalBytesDownloaded: number;
  lastDownloadTimestamp: number;
  totalBytesUploaded: number;
  lastUploadTimestamp: number;
}

const POLLING_INTERVAL_MS = 2000; // Poll every 2 seconds

export class ChromeSpeedRepository implements SpeedRepository {
  private currentTabId: number | null = null;
  private pollingIntervalId: NodeJS.Timeout | null = null;

  private lastDownloadData: { bytes: number; timestamp: number } | null = null;
  private lastUploadData: { bytes: number; timestamp: number } | null = null;

  private latestSpeedInfo: SpeedInfo | null = null;

  constructor() {
  }

  startMonitoring(tabId: number): void {
    if (this.pollingIntervalId) {
      this.stopMonitoring(); // Stop previous monitoring if any
    }
    this.currentTabId = tabId;
    this.lastDownloadData = null; // Reset for the new tab
    this.lastUploadData = null;
    this.latestSpeedInfo = null;

    this.pollSpeedData(); // Initial poll
    this.pollingIntervalId = setInterval(() => this.pollSpeedData(), POLLING_INTERVAL_MS);
  }

  stopMonitoring(): void {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
    this.currentTabId = null;
    this.lastDownloadData = null;
    this.lastUploadData = null;
    this.latestSpeedInfo = null;
  }

  async getCurrentSpeedInfo(): Promise<SpeedInfo | null> {
    // This method returns the latest calculated speed from the polling.
    // It's async to match the interface, but the value is updated by pollSpeedData.
    return this.latestSpeedInfo;
  }

  private async pollSpeedData(): Promise<void> {
    if (this.currentTabId === null) {
      return;
    }

    const key = "tab_" + this.currentTabId;
    try {
      const result = await new Promise<{ [key: string]: TabSpeedData }>((resolve) =>
        chrome.storage.local.get([key], resolve)
      );

      const currentData = result[key];

      if (currentData) {
        let downloadSpeed = 0;
        let uploadSpeed = 0;

        // Calculate download speed
        if (this.lastDownloadData && currentData.lastDownloadTimestamp > this.lastDownloadData.timestamp) {
          const timeDeltaSeconds = (currentData.lastDownloadTimestamp - this.lastDownloadData.timestamp) / 1000;
          if (timeDeltaSeconds > 0) {
            const bytesDelta = currentData.totalBytesDownloaded - this.lastDownloadData.bytes;
            downloadSpeed = bytesDelta / timeDeltaSeconds;
          }
        }
        this.lastDownloadData = {
          bytes: currentData.totalBytesDownloaded,
          timestamp: currentData.lastDownloadTimestamp
        };

        // Calculate upload speed
        if (this.lastUploadData && currentData.lastUploadTimestamp > this.lastUploadData.timestamp) {
          const timeDeltaSeconds = (currentData.lastUploadTimestamp - this.lastUploadData.timestamp) / 1000;
          if (timeDeltaSeconds > 0) {
            const bytesDelta = currentData.totalBytesUploaded - this.lastUploadData.bytes;
            uploadSpeed = bytesDelta / timeDeltaSeconds;
          }
        }
        this.lastUploadData = {
          bytes: currentData.totalBytesUploaded,
          timestamp: currentData.lastUploadTimestamp
        };

        // Ensure speeds are not negative (can happen if data resets or due to timestamp race conditions on init)
        downloadSpeed = Math.max(0, downloadSpeed);
        uploadSpeed = Math.max(0, uploadSpeed);

        this.latestSpeedInfo = this.formatSpeedInfo(downloadSpeed, uploadSpeed);

      } else {
        // No data for this tab yet, or it was cleared. Reset speeds.
        this.latestSpeedInfo = this.formatSpeedInfo(0, 0);
      }
    } catch (e) {
      console.error("ChromeSpeedRepository: Error polling speed data:", e);
      this.latestSpeedInfo = this.formatSpeedInfo(0, 0); // Reset on error
    }
  }

  private formatSpeed(bytesPerSecond: number): { speed: number; unit: string } {
    if (bytesPerSecond < 0) bytesPerSecond = 0; // Should not happen with Math.max(0, ...)

    if (bytesPerSecond < 1024) {
      return { speed: parseFloat(bytesPerSecond.toFixed(1)), unit: 'B/s' };
    } else if (bytesPerSecond < 1024 * 1024) {
      return { speed: parseFloat((bytesPerSecond / 1024).toFixed(1)), unit: 'KB/s' };
    } else {
      return { speed: parseFloat((bytesPerSecond / (1024 * 1024)).toFixed(1)), unit: 'MB/s' };
    }
  }

  private formatSpeedInfo(downloadBps: number, uploadBps: number) : SpeedInfo {
    const formattedDownload = this.formatSpeed(downloadBps);
    const formattedUpload = this.formatSpeed(uploadBps);
    return {
      downloadSpeed: formattedDownload.speed,
      downloadUnit: formattedDownload.unit,
      uploadSpeed: formattedUpload.speed,
      uploadUnit: formattedUpload.unit,
    };
  }
}
