import { action, computed, makeObservable, observable } from "mobx";
import { BIP44HDPath } from "@keplr-wallet/background";
import { useState } from "react";

export class BIP44Option {
  @observable
  protected _coinType?: number;

  @observable
  protected _account: number = 0;

  @observable
  protected _change: number = 0;

  @observable
  protected _index: number = 0;

  constructor(coinType?: number) {
    this._coinType = coinType;

    makeObservable(this);
  }

  get coinType(): number | undefined {
    return this._coinType;
  }

  get account(): number {
    return this._account;
  }

  get change(): number {
    return this._change;
  }

  get index(): number {
    return this._index;
  }

  @computed
  get bip44HDPath(): BIP44HDPath {
    return {
      account: this.account,
      change: this.change,
      addressIndex: this.index,
    };
  }

  @action
  setCoinType(coinType: number | undefined) {
    this._coinType = coinType;
  }

  @action
  setAccount(account: number) {
    this._account = account;
  }

  @action
  setChange(change: number) {
    this._change = change;
  }

  @action
  setIndex(index: number) {
    this._index = index;
  }
}

// CONTRACT: Use with `observer`
export const useBIP44Option = (coinType?: number) => {
  const [bip44Option] = useState(() => new BIP44Option(coinType));

  return bip44Option;
};
