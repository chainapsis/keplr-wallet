import { SpendableBalances } from "./types";
import { KVStore } from "@keplr-wallet/common";
import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { ChainGetter } from "../../../common";
import { CoinPretty } from "@keplr-wallet/unit";
import { computed } from "mobx";

export class ObservableChainQuerySpendableBalances extends ObservableChainQuery<SpendableBalances> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/cosmos/bank/v1beta1/spendable_balances/${address}`
    );
  }

  @computed
  get balances(): CoinPretty[] {
    if (!this.response) {
      return [];
    }

    const res: CoinPretty[] = [];

    const chainInfo = this.chainGetter.getChain(this.chainId);

    for (const bal of this.response.data.balances) {
      const currency = chainInfo.findCurrency(bal.denom);
      if (currency) {
        res.push(new CoinPretty(currency, bal.amount));
      }
    }

    return res;
  }
}

export class ObservableQuerySpendableBalances extends ObservableChainQueryMap<SpendableBalances> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (denom: string) => {
      return new ObservableChainQuerySpendableBalances(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        denom
      );
    });
  }

  getQueryBech32Address(
    bech32Address: string
  ): ObservableChainQuerySpendableBalances {
    return this.get(bech32Address) as ObservableChainQuerySpendableBalances;
  }
}
