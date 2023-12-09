import { ObservableChainQuery } from "../../chain-query";
import { ChainGetter } from "../../../chain";
import { computed, makeObservable } from "mobx";
import { BaseFee } from "./types";
import { QuerySharedContext } from "../../../common";
import { Dec } from "@keplr-wallet/unit";

export class ObservableQueryBaseFee extends ObservableChainQuery<BaseFee> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      "/osmosis/txfees/v1beta1/cur_eip_base_fee"
    );

    makeObservable(this);
  }

  get baseFeeAmount(): string {
    return this.response?.data.base_fee ?? "";
  }

  @computed
  get baseFee(): Dec | undefined {
    if (!this.response?.data.base_fee) {
      return undefined;
    }

    return new Dec(this.response.data.base_fee);
  }
}
