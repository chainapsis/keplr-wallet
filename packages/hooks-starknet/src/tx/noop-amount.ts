import { IAmountConfig, ISenderConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { ERC20Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { useState } from "react";

export class NoopAmountConfig extends TxChainSetter implements IAmountConfig {
  @observable.ref
  protected _currency?: ERC20Currency = undefined;

  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    protected readonly senderConfig: ISenderConfig
  ) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @computed
  get value(): string {
    return "0";
  }

  @action
  setValue(_value: string): void {
    // noop
  }

  @computed
  get amount(): CoinPretty[] {
    return [
      new CoinPretty(
        this.currency,
        new Dec(0)
          .mul(DecUtils.getTenExponentN(this.currency.coinDecimals))
          .truncate()
      ),
    ];
  }

  @computed
  get currency(): ERC20Currency {
    const modularChainInfoImpl = this.modularChainInfo;
    if (!("starknet" in modularChainInfoImpl.embedded)) {
      throw new Error("Chain doesn't support the starknet");
    }

    return modularChainInfoImpl.getCurrenciesByModule(
      "starknet"
    )[0] as ERC20Currency;
  }

  @action
  setCurrency(_currency: ERC20Currency | undefined) {
    // noop
  }

  get fraction(): number {
    return 0;
  }

  @action
  setFraction(_fraction: number): void {
    // noop
  }

  canUseCurrency(_currency: ERC20Currency): boolean {
    // noop
    return true;
  }

  @computed
  get uiProperties(): UIProperties {
    // noop
    return {};
  }
}

export const useNoopAmountConfig = (
  chainGetter: ChainGetter,
  chainId: string,
  senderConfig: ISenderConfig
) => {
  const [txConfig] = useState(
    () => new NoopAmountConfig(chainGetter, chainId, senderConfig)
  );
  txConfig.setChain(chainId);

  return txConfig;
};
