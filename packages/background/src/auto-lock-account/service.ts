import { KVStore } from "@keplr-wallet/common";
import { KeyRingService } from "../keyring-v2";

export class AutoLockAccountService {
  // Unit: ms
  protected autoLockDuration: number = 0;

  protected autoLockTimer: NodeJS.Timeout | null = null;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly keyRingService: KeyRingService
  ) {}

  async init() {
    browser.idle.onStateChanged.addListener((idle) => {
      this.stateChangedHandler(idle);
    });

    await this.loadDuration();
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
    this.stopAutoLockTimer();

    this.startAutoLockTimer();
  }

  private startAutoLockTimer() {
    if (!this.keyRingIsUnlocked) {
      throw new Error("Keyring is not unlocked");
    }

    if (this.autoLockDuration <= 0) {
      return;
    }

    this.autoLockTimer = setTimeout(() => {
      this.stopAutoLockTimer();
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
      this.keyRingService.lockKeyRing();
    }
  }

  get keyRingIsUnlocked(): boolean {
    return this.keyRingService.keyRingStatus === "unlocked";
  }

  public getAutoLockDuration(): number {
    return this.autoLockDuration;
  }

  public setDuration(duration: number): Promise<void> {
    this.autoLockDuration = duration;

    if (duration <= 0) {
      this.stopAutoLockTimer();
    }

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
