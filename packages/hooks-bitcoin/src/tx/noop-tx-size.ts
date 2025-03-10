import { ITxSizeConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { useState } from "react";

export class NoopTxSizeConfig extends TxChainSetter implements ITxSizeConfig {
  @observable
  protected _value: string = "";

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @action
  setValue(_value: string | number): void {
    // noop
  }

  get value(): string {
    return "0";
  }

  get txSize(): number {
    return 0;
  }

  @computed
  get uiProperties(): UIProperties {
    return {};
  }
}

export const useNoopTxSizeConfig = (
  chainGetter: ChainGetter,
  chainId: string
) => {
  const [txConfig] = useState(() => new NoopTxSizeConfig(chainGetter, chainId));
  txConfig.setChain(chainId);

  return txConfig;
};
