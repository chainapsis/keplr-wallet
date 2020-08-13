export interface InitLedgerNotifiyHandler {
  onInitFailed(): void;
}

export class LedgerInitNotifyKeeper {
  constructor(
    private readonly onInitNotifiyHandler: InitLedgerNotifiyHandler
  ) {}

  onInitFailed(): void {
    this.onInitNotifiyHandler.onInitFailed();
  }
}
