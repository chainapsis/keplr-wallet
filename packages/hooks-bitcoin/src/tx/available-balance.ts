import { IAvailableBalanceConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { useState } from "react";
import { CoinPretty } from "@keplr-wallet/unit";

export class AvailableBalanceConfig
  extends TxChainSetter
  implements IAvailableBalanceConfig
{
  @observable.shallow
  protected _availableBalanceByAddress: Record<string, CoinPretty | undefined> =
    {};

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @action
  setAvailableBalanceByAddress(
    address: string,
    availableBalance: CoinPretty | undefined
  ): void {
    this._availableBalanceByAddress[address] = availableBalance;
  }

  availableBalanceByAddress(address: string): CoinPretty | undefined {
    return this._availableBalanceByAddress[address];
  }

  @computed
  get uiProperties(): UIProperties {
    return {};
  }
}

export const useAvailableBalanceConfig = (
  chainGetter: ChainGetter,
  chainId: string
) => {
  const [config] = useState(
    () => new AvailableBalanceConfig(chainGetter, chainId)
  );
  config.setChain(chainId);

  return config;
};
