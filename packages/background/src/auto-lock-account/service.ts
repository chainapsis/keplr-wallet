import { KVStore } from "@keplr-wallet/common";
import { KeyRingStatus } from "../keyring";

export class AutoLockAccountService {
  protected keyringService!: {
    lock: () => void;
    readonly keyRingStatus: KeyRingStatus;
  };

  // Unit: ms
  protected autoLockDuration: number = 0;

  protected autoLockTimer: NodeJS.Timeout | null = null;

  constructor(protected readonly kvStore: KVStore) {}

  async init(keyringService: {
    lock: () => void;
    readonly keyRingStatus: KeyRingStatus;
  }) {
    this.keyringService = keyringService;

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
