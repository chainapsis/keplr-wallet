export interface TxResultNotifiyHandler {
  onTxCommitted(chainId: string): void;
}

export class BackgroundTxNotifyKeeper {
  constructor(
    private readonly txResultNotifiyHandler: TxResultNotifiyHandler
  ) {}

  onTxCommitted(chainId: string): void {
    this.txResultNotifiyHandler.onTxCommitted(chainId);
  }
}
