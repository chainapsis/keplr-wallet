import { ChainGetter } from "@keplr-wallet/stores";
import { Keplr } from "@keplr-wallet/types";
import { action, makeObservable, observable } from "mobx";

export class BitcoinAccountBase {
  @observable
  protected _isSendingTx: boolean = false;

  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly getKeplr: () => Promise<Keplr | undefined>
  ) {
    makeObservable(this);
  }

  @action
  setIsSendingTx(value: boolean) {
    this._isSendingTx = value;
  }

  get isSendingTx(): boolean {
    return this._isSendingTx;
  }

  // TODO: estimate fee

  // TODO: make send tx

  // TODO: sign and push tx (keplr interface 확장 필요)

  // TODO: track tx status (이거 좀 어려움)

  // static validate address
}
