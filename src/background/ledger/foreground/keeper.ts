export interface InitLedgerNotifiyHandler {
  onInitFailed(): void;
  onInitResumed(): void;
}

export interface SignLedgerNotifiyHandler {
  onSignCompleted(rejected: boolean): void;
}

export class LedgerInitNotifyKeeper {
  constructor(
    private readonly onInitNotifiyHandler: InitLedgerNotifiyHandler,
    private readonly onSignNotifiyHandler: SignLedgerNotifiyHandler
  ) {}

  onInitFailed(): void {
    this.onInitNotifiyHandler.onInitFailed();
  }

  onInitResumed(): void {
    this.onInitNotifiyHandler.onInitResumed();
  }

  onSignCompleted(rejected: boolean): void {
    this.onSignNotifiyHandler.onSignCompleted(rejected);
  }
}
