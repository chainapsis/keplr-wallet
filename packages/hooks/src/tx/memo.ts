import { IMemoConfig } from "./types";
import { action, makeObservable, observable } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { TxChainSetter } from "./chain";
import { useState } from "react";
import { validateMnemonic } from "bip39";

export class MemoConfig extends TxChainSetter implements IMemoConfig {
  @observable
  protected _memo: string = "";

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);
    makeObservable(this);
  }

  get memo(): string {
    return this._memo;
  }

  @action
  setMemo(memo: string) {
    this._memo = memo;
  }

  get error(): Error | undefined {
    // prevent simple inclusion of a valid mnemonic in the memo field
    if (validateMnemonic(this._memo.trim().toLowerCase())) {
      return Error("cannot use a valid mnemonic as a memo");
    }
    return undefined;
  }
}

export const useMemoConfig = (chainGetter: ChainGetter, chainId: string) => {
  const [config] = useState(() => new MemoConfig(chainGetter, chainId));
  config.setChain(chainId);

  return config;
};
