import {
  ChainGetter,
  ObservableQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { computed, makeObservable, observable, runInAction } from "mobx";
import { StarknetValidator, StarknetValidators } from "./types";
import { computedFn } from "mobx-utils";
import { ObservableQueryPoolMemberInfoMap } from "./pool-member-info";

export class ObservableQueryValidators extends ObservableQuery<StarknetValidators> {
  protected readonly chainId: string;
  protected readonly chainGetter: ChainGetter;

  @observable.shallow
  protected poolMemberInfoMapByStarknetHexAddress: Map<
    string,
    ObservableQueryPoolMemberInfoMap
  > = new Map();

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(
      sharedContext,
      "https://prod-staking-api.karnot.xyz/api/",
      "validators?sort_by=total_stake&sort_order=desc" // TODO: set sort_by and sort_order as params
    );
    makeObservable(this);

    this.chainId = chainId;
    this.chainGetter = chainGetter;
  }

  protected override canFetch(): boolean {
    if (this.chainId === "starknet:SN_SEPOLIA") {
      return false;
    }

    return super.canFetch();
  }

  @computed
  get validators(): StarknetValidator[] {
    if (!this.response || !this.response.data) {
      return [];
    }

    return this.response.data.validators;
  }

  readonly getQueryPoolMemberInfoMap = computedFn(
    (starknetHexAddress: string) => {
      const validators = this.validators;
      if (!validators) {
        return;
      }

      if (!this.poolMemberInfoMapByStarknetHexAddress.has(starknetHexAddress)) {
        runInAction(() => {
          const queryPoolMemberInfoMap = new ObservableQueryPoolMemberInfoMap(
            this.sharedContext,
            this.chainId,
            this.chainGetter,
            starknetHexAddress
          );

          this.poolMemberInfoMapByStarknetHexAddress.set(
            starknetHexAddress,
            queryPoolMemberInfoMap
          );
        });
      }

      return this.poolMemberInfoMapByStarknetHexAddress.get(starknetHexAddress);
    }
  );
}
