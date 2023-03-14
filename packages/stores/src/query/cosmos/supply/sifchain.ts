import { ObservableQuery, QuerySharedContext } from "../../../common";
import { computed, makeObservable } from "mobx";

export type SifchainLiquidityAPYResult = { rate: number };

export class ObservableQuerySifchainLiquidityAPY extends ObservableQuery<SifchainLiquidityAPYResult> {
  protected readonly chainId: string;

  constructor(sharedContext: QuerySharedContext, chainId: string) {
    super(
      sharedContext,
      "https://data.sifchain.finance/",
      `beta/validator/stakingRewards`
    );

    this.chainId = chainId;
    makeObservable(this);
  }

  protected override canFetch(): boolean {
    return this.chainId.startsWith("sifchain");
  }

  @computed
  get liquidityAPY(): number {
    if (this.response) {
      return Number(this.response.data.rate) * 100;
    }

    return 0;
  }
}
