import { KVStore } from "@keplr-wallet/common";
import { KeyRingStatus } from "../keyring";
import { KeyRingService } from "../keyring/service";

export class AutoLockAccountService {
  protected keyringService!: KeyRingService;

  // Unit: ms
  protected autoLockDuration: number = 0;

  protected monitoringAppIsActiveTimer: NodeJS.Timeout | null = null;
  protected monitoringInterval: number = 10000;

  protected autoLockTimer: NodeJS.Timeout | null = null;
  protected latestActiveTime: number | null = null;

  constructor(protected readonly kvStore: KVStore) {}

  async init(keyringService: KeyRingService) {
    this.keyringService = keyringService;
    await this.loadDuration();
    this.startMonitoringSchedule();

    browser.idle.onStateChanged.addListener((idle) => {
      this.stateChangedHandler(idle);
    });
  }

  private stateChangedHandler(newState: browser.idle.IdleState) {
    if (this.autoLockDuration > 0) {
      if ((newState as any) === "locked") this.lock();
    }
  }

  private startMonitoringSchedule() {
    this.stopMonitoringSchedule();
    if (this.autoLockDuration > 0) {
      this.monitoringAppIsActiveTimer = setTimeout(() => {
        this.updateLatestActiveTime();
        const isAppActive = this.getAppIsActive();
        if (isAppActive) {
          this.stopAutoLockAccountSchedule();
        } else {
          this.startAutoLockAccountSchedule();
        }
        this.startMonitoringSchedule();
      }, this.monitoringInterval);
    }
  }

  private stopMonitoringSchedule() {
    if (this.monitoringAppIsActiveTimer != null) {
      clearTimeout(this.monitoringAppIsActiveTimer);
      this.monitoringAppIsActiveTimer = null;
    }
  }

  private updateLatestActiveTime() {
    for (const view of browser.extension.getViews()) {
      const background = browser.extension.getBackgroundPage();
      if (!background || background.location.href !== view.location.href) {
        const now = Date.now();
        this.latestActiveTime = now;
        this.stopAutoLockAccountSchedule();
      }
    }
  }

  private getAppIsActive(): boolean {
    const now = Date.now();
    if (this.latestActiveTime != null) {
      if (this.latestActiveTime + this.monitoringInterval > now) {
        return true;
      }
    }

    return false;
  }

  private startAutoLockAccountSchedule() {
    if (
      this.keyringService != null &&
      (this.keyringService.keyRingStatus === KeyRingStatus.LOCKED ||
        this.keyringService.keyRingStatus === KeyRingStatus.NOTLOADED)
    )
      return;
    this.autoLockTimer = setTimeout(() => {
      this.lock();
    }, this.autoLockDuration);
  }

  private stopAutoLockAccountSchedule() {
    if (this.autoLockTimer != null) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }
  }

  private lock() {
    if (
      this.keyringService != null &&
      this.keyringService.keyRingStatus === KeyRingStatus.UNLOCKED
    ) {
      this.keyringService.lock();
    }
  }

  public getAutoLockDuration(): number {
    return this.autoLockDuration;
  }

  async updateAutoLockDuration(duration: number) {
    this.saveDuration(duration);
    await this.loadDuration();
    if (this.autoLockDuration > 0) {
      this.startMonitoringSchedule();
    } else {
      this.stopMonitoringSchedule();
    }
  }

  private saveDuration(duration: number) {
    this.kvStore.set("autoLockDuration", duration);
  }

  private async loadDuration() {
    let duration = await this.kvStore.get<number>("autoLockDuration");

    if (duration == null) {
      duration = 0;
      this.saveDuration(duration);
    }
    this.autoLockDuration = duration;
  }
}
