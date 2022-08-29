import { KVStore } from "@keplr-wallet/common";
import { KeyRingStatus } from "../keyring";
import { KeyRingService } from "../keyring/service";

export class AutoLockAccountService {
  protected keyringService!: KeyRingService;

  // Unit: ms
  protected autoLockInterval: number = 0;

  protected autoLockTimer: NodeJS.Timeout | null = null;
  protected monitoringAppIsActiveTimer: NodeJS.Timeout | null = null;
  protected monitoringInterval: number = 10000;

  protected appLastUsedTime: number | null = null;

  constructor(protected readonly kvStore: KVStore) {}

  async init(keyringService: KeyRingService) {
    this.keyringService = keyringService;
    await this.loadInterval();
    this.startMonitoringSchedule();
  }

  private startMonitoringSchedule() {
    this.stopMonitoringSchedule();
    if (this.autoLockInterval > 0) {
      this.monitoringAppIsActiveTimer = setTimeout(() => {
        const isAppActive = this.getAppIsActive();
        if (isAppActive) {
          this.stopAutoLockAccountSchedule();
        } else {
          if (this.autoLockTimer == null) {
            this.startAutoLockAccountSchedule();
          }
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

  private getAppIsActive(): boolean {
    const now = Date.now();
    let appIsActive = false;
    if (this.appLastUsedTime != null) {
      if (this.appLastUsedTime + this.monitoringInterval > now) {
        appIsActive = true;
        this.appLastUsedTime = now;
      } else {
        appIsActive = false;
      }
    } else {
      this.appLastUsedTime = now;
    }

    return appIsActive;
  }

  private startAutoLockAccountSchedule() {
    this.stopAutoLockAccountSchedule();

    if (
      this.keyringService != null &&
      (this.keyringService.keyRingStatus === KeyRingStatus.LOCKED ||
        this.keyringService.keyRingStatus === KeyRingStatus.NOTLOADED)
    )
      return;

    if (this.autoLockInterval > 0) {
      this.autoLockTimer = setTimeout(() => {
        this.lock();
        this.startAutoLockAccountSchedule();
      }, this.autoLockInterval);
    }
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

  public updateAppLastUsedTime() {
    if (this.autoLockInterval > 0) {
      this.stopAutoLockAccountSchedule();
      this.appLastUsedTime = Date.now();
    }
  }

  public getAutoLockInterval(): number {
    return this.autoLockInterval;
  }

  async updateAutoLockInterval(interval: number) {
    this.saveInterval(interval);
    await this.loadInterval();
    if (this.autoLockInterval > 0) {
      this.startMonitoringSchedule();
    } else {
      this.stopMonitoringSchedule();
    }
  }

  private saveInterval(interval: number) {
    this.kvStore.set("autoLockInterval", interval);
  }

  private async loadInterval() {
    let interval = await this.kvStore.get<number>("autoLockInterval");

    if (interval == null) {
      interval = 0;
      this.saveInterval(interval);
    }
    this.autoLockInterval = interval;
  }
}
