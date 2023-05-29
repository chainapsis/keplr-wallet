import { ObservableChainQuery } from "../../../chain-query";
import { ChainGetter } from "../../../../chain";
import { makeObservable } from "mobx";
import { BaseDenom } from "./types";
import { QuerySharedContext } from "../../../../common";

export class ObservableQueryTxFeesBaseDenom extends ObservableChainQuery<BaseDenom> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      "/osmosis/txfees/v1beta1/base_denom"
    );

    makeObservable(this);
  }

  get baseDenom(): string {
    return this.response?.data.base_denom ?? "";
  }
}
