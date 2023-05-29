import { AmountConfig, ISenderConfig } from "../tx";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { computed, makeObservable } from "mobx";
import { DenomHelper } from "@keplr-wallet/common";
import { useState } from "react";

export class IBCAmountConfig extends AmountConfig {
  constructor(
    chainGetter: ChainGetter,
    queriesStore: IQueriesStore,
    initialChainId: string,
    senderConfig: ISenderConfig
  ) {
    super(chainGetter, queriesStore, initialChainId, senderConfig);

    makeObservable(this);
  }

  @computed
  override get selectableCurrencies(): AppCurrency[] {
    // Only native currencies can be sent by IBC transfer.
    return super.selectableCurrencies.filter(
      (cur) => new DenomHelper(cur.coinMinimalDenom).type === "native"
    );
  }
}

export const useIBCAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore,
  chainId: string,
  senderConfig: ISenderConfig
) => {
  const [txConfig] = useState(
    () => new IBCAmountConfig(chainGetter, queriesStore, chainId, senderConfig)
  );
  txConfig.setChain(chainId);

  return txConfig;
};
