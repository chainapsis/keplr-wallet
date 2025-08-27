import { ObservableChainQuery } from "../../../chain-query";
import { BaseFee } from "./types";
import { QuerySharedContext } from "../../../../common";
import { ChainGetter } from "../../../../chain";
import { makeObservable } from "mobx";
import { Dec } from "@keplr-wallet/unit";

export class ObservableQueryEvmFeeMarketBaseFee extends ObservableChainQuery<BaseFee> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "/feemarket/v1/base_fee");

    makeObservable(this);
  }

  get baseFee(): {
    amount: Dec | null;
  } {
    if (!this.response || !this.response.data.base_fee) {
      return {
        amount: null,
      };
    }

    return {
      amount: new Dec(this.response.data.base_fee.amount),
    };
  }
}
