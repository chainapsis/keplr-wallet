import { AmountConfig, IFeeConfig } from "../tx";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { computed, makeObservable } from "mobx";
import { DenomHelper } from "@keplr-wallet/common";
import { useState } from "react";

export class IBCAmountConfig extends AmountConfig {
  constructor(
    chainGetter: ChainGetter,
    // eslint-disable-next-line @typescript-eslint/ban-types
    protected readonly queriesStore: IQueriesStore<{}>,
    initialChainId: string,
    sender: string,
    feeConfig: IFeeConfig | undefined
  ) {
    super(chainGetter, queriesStore, initialChainId, sender, feeConfig);

    makeObservable(this);
  }

  @computed
  get sendableCurrencies(): AppCurrency[] {
    // Only native currencies can be sent by IBC transfer.
    return super.sendableCurrencies.filter(
      (cur) => new DenomHelper(cur.coinMinimalDenom).type === "native"
    );
  }
}

export const useIBCAmountConfig = (
  chainGetter: ChainGetter,
  // eslint-disable-next-line @typescript-eslint/ban-types
  queriesStore: IQueriesStore<{}>,
  chainId: string,
  sender: string
) => {
  const [txConfig] = useState(
    () =>
      new IBCAmountConfig(chainGetter, queriesStore, chainId, sender, undefined)
  );
  txConfig.setChain(chainId);
  txConfig.setSender(sender);

  return txConfig;
};
