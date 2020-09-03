export interface InitLedgerNotifiyHandler {
  onInitFailed(): void;
  onInitResumed(): void;
}

export interface GetPublicKeyNotifiyHandler {
  onGetPublicKeyCompleted(): void;
}

export interface SignLedgerNotifiyHandler {
  onSignCompleted(rejected: boolean): void;
}

export class LedgerInitNotifyKeeper {
  constructor(
    private readonly onInitNotifiyHandler: InitLedgerNotifiyHandler,
    private readonly onGetPublicKeyNotifyHandler: GetPublicKeyNotifiyHandler,
    private readonly onSignNotifiyHandler: SignLedgerNotifiyHandler
  ) {}

  onInitFailed(): void {
    this.onInitNotifiyHandler.onInitFailed();
  }

  onInitResumed(): void {
    this.onInitNotifiyHandler.onInitResumed();
  }

  onGetPublicKeyCompleted(): void {
    this.onGetPublicKeyNotifyHandler.onGetPublicKeyCompleted();
  }

  onSignCompleted(rejected: boolean): void {
    this.onSignNotifiyHandler.onSignCompleted(rejected);
  }
}
