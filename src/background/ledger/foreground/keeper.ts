export interface InitLedgerNotifiyHandler {
  onInitFailed(): void;
  onInitResumed(): void;
}

export interface SignLedgerNotifiyHandler {
  onSignCompleted(): void;
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

  onSignCompleted(): void {
    this.onSignNotifiyHandler.onSignCompleted();
  }
}
