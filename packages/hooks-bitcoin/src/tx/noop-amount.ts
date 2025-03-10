import { IAmountConfig, ISenderConfig, UIProperties } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@keplr-wallet/stores";
import { action, computed, makeObservable, observable } from "mobx";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { useState } from "react";

export class NoopAmountConfig extends TxChainSetter implements IAmountConfig {
  @observable.ref
  protected _currency?: AppCurrency = undefined;

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
  get currency(): AppCurrency {
    const modularChainInfo = this.modularChainInfo;
    if (!("bitcoin" in modularChainInfo)) {
      throw new Error("Chain doesn't support the bitcoin");
    }

    return modularChainInfo.bitcoin.currencies[0];
  }

  @action
  setCurrency(_currency: AppCurrency | undefined) {
    // noop
  }

  get fraction(): number {
    return 0;
  }

  @action
  setFraction(_fraction: number): void {
    // noop
  }

  canUseCurrency(_currency: AppCurrency): boolean {
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
  const [config] = useState(
    () => new NoopAmountConfig(chainGetter, chainId, senderConfig)
  );
  config.setChain(chainId);

  return config;
};
