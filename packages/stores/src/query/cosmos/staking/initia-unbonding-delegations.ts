import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { InitiaUnbondingDelegations, UnbondingDelegation } from "./types";
import { ChainGetter } from "../../../chain";
import { CoinPretty, Int, Dec } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { QuerySharedContext } from "../../../common";
import { Coin } from "@keplr-wallet/types";

export class ObservableQueryInitiaUnbondingDelegationsInner extends ObservableChainQuery<InitiaUnbondingDelegations> {
  protected bech32Address: string;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/initia/mstaking/v1/delegators/${bech32Address}/unbonding_delegations?pagination.limit=1000`
    );
    makeObservable(this);

    this.bech32Address = bech32Address;
  }

  protected override canFetch(): boolean {
    if (!this.chainGetter.getChain(this.chainId).stakeCurrency) {
      return false;
    }
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }

  // a function to extract amount from unbonding balance
  // For Initia chain, the balance is an array of Coin
  protected getAmountFromBalanceArray(balance: Coin[]): string {
    const stakeDenom =
      this.chainGetter.getChain(this.chainId).stakeCurrency?.coinMinimalDenom ??
      "unit";
    const coin = (balance as Coin[]).find((coin) => coin.denom === stakeDenom);
    return coin?.amount ?? "0";
  }

  @computed
  get total(): CoinPretty | undefined {
    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    if (!stakeCurrency) {
      return;
    }

    if (!this.response) {
      return new CoinPretty(stakeCurrency, new Int(0)).ready(false);
    }

    let totalBalance = new Int(0);
    for (const unbondingDelegation of this.response.data.unbonding_responses) {
      for (const entry of unbondingDelegation.entries) {
        const amount = this.getAmountFromBalanceArray(entry.balance);
        const amountInt = new Int(amount);
        if (amountInt.gt(new Int(0))) {
          totalBalance = totalBalance.add(amountInt);
        }
      }
    }

    return new CoinPretty(stakeCurrency, totalBalance);
  }

  @computed
  get unbondingBalances(): {
    validatorAddress: string;
    entries: {
      creationHeight: Int;
      completionTime: string;
      balance: CoinPretty;
    }[];
  }[] {
    const unbondings = this.unbondings;

    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    if (!stakeCurrency) {
      return [];
    }

    const result = [];

    for (const unbonding of unbondings) {
      const entries = [];
      for (const entry of unbonding.entries) {
        const balance = new CoinPretty(stakeCurrency, new Int(entry.balance));
        if (balance.toDec().gt(new Dec(0))) {
          entries.push({
            creationHeight: new Int(entry.creation_height),
            completionTime: entry.completion_time,
            balance,
          });
        }
      }

      if (entries.length > 0) {
        result.push({
          validatorAddress: unbonding.validator_address,
          entries,
        });
      }
    }

    return result;
  }

  @computed
  get unbondings(): UnbondingDelegation[] {
    if (!this.response) {
      return [];
    }

    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    return this.response.data.unbonding_responses.map((unbonding) => {
      const filtered = unbonding.entries.filter((entry) =>
        entry.balance.some((coin) => {
          return coin.denom === stakeCurrency?.coinMinimalDenom;
        })
      );

      const entries = filtered.map((entry) => ({
        ...entry,
        balance: this.getAmountFromBalanceArray(entry.balance),
      }));

      return {
        ...unbonding,
        entries,
      };
    });
  }
}

export class ObservableQueryInitiaUnbondingDelegations extends ObservableChainQueryMap<InitiaUnbondingDelegations> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryInitiaUnbondingDelegationsInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getQueryBech32Address(
    bech32Address: string
  ): ObservableQueryInitiaUnbondingDelegationsInner {
    return this.get(
      bech32Address
    ) as ObservableQueryInitiaUnbondingDelegationsInner;
  }
}
