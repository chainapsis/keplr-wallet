import { IGasConfig } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, makeObservable, observable } from "mobx";
import { useState } from "react";

export class GasConfig extends TxChainSetter implements IGasConfig {
  @observable
  protected _gas: number;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    initialGas: number = 0
  ) {
    super(chainGetter, initialChainId);

    this._gas = initialGas;

    makeObservable(this);
  }

  get gas(): number {
    return this._gas;
  }

  @action
  setGas(gas: number) {
    this._gas = Math.floor(gas);
  }

  getError(): Error | undefined {
    if (this.gas <= 0) {
      return new Error("Gas should be greater than 0");
    }
    return;
  }
}

export const useGasConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  initialGas: number = 0
) => {
  const [txConfig] = useState(new GasConfig(chainGetter, chainId, initialGas));
  txConfig.setChain(chainId);

  return txConfig;
};
