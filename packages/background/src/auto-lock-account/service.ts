import { KVStore } from "@keplr-wallet/common";
import { KeyRingService, KeyRingStatus } from "../keyring";

export class AutoLockAccountService {
  protected keyringService!: KeyRingService;

  // Unit: ms
  protected autoLockDuration: number = 0;

  protected appStateCheckTimer: NodeJS.Timeout | null = null;
  protected monitoringInterval: number = 10000;

  protected autoLockTimer: NodeJS.Timeout | null = null;
  protected latestActiveTime: number | null = null;

  constructor(protected readonly kvStore: KVStore) {}

  async init(keyringService: KeyRingService) {
    this.keyringService = keyringService;
    await this.loadDuration();

    browser.idle.onStateChanged.addListener((idle) => {
      this.stateChangedHandler(idle);
    });
  }

  private stateChangedHandler(newState: browser.idle.IdleState) {
    if (this.autoLockDuration > 0) {
      if ((newState as any) === "locked") {
        this.stopAutoLockTimer();
        this.lock();
      }
    }
  }

  startAppStateCheckTimer() {
    this.stopAppStateCheckTimer();
    if (this.autoLockDuration > 0) {
      this.appStateCheckTimer = setTimeout(() => {
        this.updateLatestActiveTime();
        const isAppActive = this.getAppIsActive();
        if (isAppActive) {
          this.stopAutoLockTimer();
          this.startAppStateCheckTimer();
        } else {
          this.startAutoLockTimer();
          this.stopAppStateCheckTimer();
        }
      }, this.monitoringInterval);
    }
  }

  private stopAppStateCheckTimer() {
    if (this.appStateCheckTimer != null) {
      clearTimeout(this.appStateCheckTimer);
      this.appStateCheckTimer = null;
    }
  }

  private updateLatestActiveTime() {
    for (const view of browser.extension.getViews()) {
      const background = browser.extension.getBackgroundPage();
      if (!background || background.location.href !== view.location.href) {
        const now = Date.now();
        this.latestActiveTime = now;
        this.stopAutoLockTimer();
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

  private startAutoLockTimer() {
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

  private stopAutoLockTimer() {
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
      this.startAppStateCheckTimer();
    } else {
      this.stopAppStateCheckTimer();
    }
  }

  private saveDuration(duration: number): Promise<void> {
    return this.kvStore.set("autoLockDuration", duration);
  }

  private async loadDuration() {
    let duration = await this.kvStore.get<number>("autoLockDuration");

    if (duration == null) {
      duration = 0;
      await this.saveDuration(duration);
    }
    this.autoLockDuration = duration;
  }
}
