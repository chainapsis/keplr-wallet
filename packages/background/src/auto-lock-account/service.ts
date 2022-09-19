import { KVStore } from "@keplr-wallet/common";
import { KeyRingStatus } from "../keyring";

export class AutoLockAccountService {
  protected keyringService!: {
    lock: () => void;
    readonly keyRingStatus: KeyRingStatus;
  };

  // Unit: ms
  protected autoLockDuration: number = 0;

  protected appStateCheckTimer: NodeJS.Timeout | null = null;

  protected autoLockTimer: NodeJS.Timeout | null = null;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly opts: {
      readonly monitoringInterval: number;
    } = {
      monitoringInterval: 10000,
    }
  ) {}

  init(keyringService: {
    lock: () => void;
    readonly keyRingStatus: KeyRingStatus;
  }) {
    this.keyringService = keyringService;
    // No need to wait
    this.loadDuration();

    browser.idle.onStateChanged.addListener((idle) => {
      this.stateChangedHandler(idle);
    });
  }

  private stateChangedHandler(newState: browser.idle.IdleState) {
    if (this.autoLockDuration > 0) {
      if ((newState as any) === "locked") {
        this.stopAppStateCheckTimer();
        this.stopAutoLockTimer();
        this.lock();
      }
    }
  }

  startAppStateCheckTimer() {
    this.stopAppStateCheckTimer();
    if (this.autoLockDuration > 0 && this.keyRingIsUnlocked) {
      this.appStateCheckTimer = setTimeout(() => {
        const isAppActive = this.checkAppIsActive();
        if (isAppActive) {
          this.stopAutoLockTimer();
          this.startAppStateCheckTimer();
        } else {
          if (this.keyRingIsUnlocked) {
            this.startAutoLockTimer();
          }
          this.stopAppStateCheckTimer();
        }
      }, this.opts.monitoringInterval);
    }
  }

  private stopAppStateCheckTimer() {
    if (this.appStateCheckTimer != null) {
      clearTimeout(this.appStateCheckTimer);
      this.appStateCheckTimer = null;
    }
  }

  public checkAppIsActive(): boolean {
    const background = browser.extension.getBackgroundPage();
    const views = browser.extension.getViews();
    if (background) {
      for (const view of views) {
        if (background.location.href !== view.location.href) {
          return true;
        }
      }
    } else if (views.length > 0) {
      return true;
    }

    return false;
  }

  private startAutoLockTimer() {
    if (!this.keyRingIsUnlocked) {
      throw new Error("Keyring is not unlocked");
    }

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
    if (this.keyRingIsUnlocked) {
      this.keyringService.lock();
    }
  }

  get keyRingIsUnlocked(): boolean {
    if (this.keyringService == null) {
      throw new Error("Keyring service is null");
    }

    return this.keyringService.keyRingStatus === KeyRingStatus.UNLOCKED;
  }

  public getAutoLockDuration(): number {
    return this.autoLockDuration;
  }

  public setDuration(duration: number): Promise<void> {
    this.autoLockDuration = duration;
    return this.kvStore.set("autoLockDuration", duration);
  }

  private async loadDuration() {
    const duration = await this.kvStore.get<number>("autoLockDuration");

    if (duration == null) {
      this.autoLockDuration = 0;
    } else {
      this.autoLockDuration = duration;
    }
  }
}
