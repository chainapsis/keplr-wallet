import { ObservableQuery, QuerySharedContext } from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";
import { StarknetValidator, StarknetValidators } from "./types";

export class ObservableQueryValidators extends ObservableQuery<StarknetValidators> {
  constructor(sharedContext: QuerySharedContext) {
    super(
      sharedContext,
      "https://prod-staking-api.karnot.xyz/api/",
      "validators?sort_by=total_stake&sort_order=desc" // TODO: set sort_by and sort_order as params
    );

    makeObservable(this);
  }

  @computed
  get validators(): StarknetValidator[] {
    if (!this.response || !this.response.data) {
      return [];
    }

    return this.response.data.validators;
  }
}
