import { IMemoConfig } from "./types";
import { action, makeObservable, observable } from "mobx";
import { ChainGetter } from "@keplr-wallet/stores";
import { TxChainSetter } from "./chain";
import { useRef } from "react";

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

  getError(): Error | undefined {
    return undefined;
  }
}

export const useMemoConfig = (chainGetter: ChainGetter, chainId: string) => {
  const config = useRef(new MemoConfig(chainGetter, chainId)).current;
  config.setChain(chainId);

  return config;
};
