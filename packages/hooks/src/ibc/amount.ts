import { AmountConfig } from "../tx/amount";
import { ChainGetter } from "@keplr-wallet/stores";
import { ObservableQueryBalances } from "@keplr-wallet/stores/build/query/balances";
import { AppCurrency } from "@keplr-wallet/types";
import { computed, makeObservable } from "mobx";
import { DenomHelper } from "@keplr-wallet/common";
import { useState } from "react";
import { IFeeConfig } from "../tx";

export class IBCAmountConfig extends AmountConfig {
  constructor(
    chainGetter: ChainGetter,
    initialChainId: string,
    sender: string,
    feeConfig: IFeeConfig | undefined,
    queryBalances: ObservableQueryBalances
  ) {
    super(chainGetter, initialChainId, sender, feeConfig, queryBalances);

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
  chainId: string,
  sender: string,
  queryBalances: ObservableQueryBalances
) => {
  const [txConfig] = useState(
    () =>
      new IBCAmountConfig(
        chainGetter,
        chainId,
        sender,
        undefined,
        queryBalances
      )
  );
  txConfig.setChain(chainId);
  txConfig.setQueryBalances(queryBalances);
  txConfig.setSender(sender);

  return txConfig;
};
