import {
  ChainGetter,
  ObservableChainQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { DynamicFeeParams } from "./types";

export class ObservableQueryInitiaDynamicFee extends ObservableChainQuery<DynamicFeeParams> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, "/initia/dynamicfee/v1/params");

    makeObservable(this);
  }

  @computed
  get baseGasPrice(): number | undefined {
    if (!this.response) {
      return undefined;
    }
    if (!this.response.data.params) {
      return undefined;
    }

    const n = parseFloat(this.response.data.params.base_gas_price);
    if (Number.isNaN(n)) {
      return undefined;
    }

    return n;
  }
}
