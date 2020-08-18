export interface InitLedgerNotifiyHandler {
  onInitFailed(): void;
  onInitResumed(): void;
}

export class LedgerInitNotifyKeeper {
  constructor(
    private readonly onInitNotifiyHandler: InitLedgerNotifiyHandler
  ) {}

  onInitFailed(): void {
    this.onInitNotifiyHandler.onInitFailed();
  }

  onInitResumed(): void {
    this.onInitNotifiyHandler.onInitResumed();
  }
}
