import { ObservableQuery } from "../../../common";
import { KVStore } from "@keplr-wallet/common";
import Axios from "axios";
import { computed, makeObservable } from "mobx";

export type SifchainLiquidityAPYResult = {
  statusCode: number;
  body: { liqValRewards: string };
};

export class ObservableQuerySifchainLiquidityAPY extends ObservableQuery<SifchainLiquidityAPYResult> {
  protected readonly chainId: string;

  constructor(kvStore: KVStore, chainId: string) {
    const instance = Axios.create({
      baseURL: "https://vtdbgplqd6.execute-api.us-west-2.amazonaws.com/",
    });

    super(kvStore, instance, `default/liqvalrewards`);

    this.chainId = chainId;
    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.chainId.startsWith("sifchain");
  }

  @computed
  get liquidityAPY(): number {
    if (this.response) {
      return Number(this.response.data.body.liqValRewards);
    }

    return 0;
  }
}
