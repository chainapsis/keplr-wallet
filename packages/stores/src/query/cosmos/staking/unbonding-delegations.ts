import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { UnbondingDelegation, UnbondingDelegations } from "./types";
import { ChainGetter } from "../../../chain";
import { CoinPretty, Int, Dec } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { QuerySharedContext } from "../../../common";

export class ObservableQueryUnbondingDelegationsInner extends ObservableChainQuery<UnbondingDelegations> {
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
      `/cosmos/staking/v1beta1/delegators/${bech32Address}/unbonding_delegations?pagination.limit=1000`
    );
    makeObservable(this);

    this.bech32Address = bech32Address;
  }

  protected override canFetch(): boolean {
    if (!this.chainGetter.getModularChainInfoImpl(this.chainId).stakeCurrency) {
      return false;
    }
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }

  @computed
  get total(): CoinPretty | undefined {
    const stakeCurrency = this.chainGetter.getModularChainInfoImpl(
      this.chainId
    ).stakeCurrency;

    if (!stakeCurrency) {
      return;
    }

    if (!this.response) {
      return new CoinPretty(stakeCurrency, new Int(0)).ready(false);
    }

    let totalBalance = new Int(0);
    for (const unbondingDelegation of this.response.data.unbonding_responses) {
      for (const entry of unbondingDelegation.entries) {
        const amount = new Int(entry.balance);
        if (amount.gt(new Int(0))) {
          totalBalance = totalBalance.add(amount);
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

    const stakeCurrency = this.chainGetter.getModularChainInfoImpl(
      this.chainId
    ).stakeCurrency;

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

    const res: UnbondingDelegation[] = [];

    for (const unbonding of this.response.data.unbonding_responses) {
      const u = {
        ...unbonding,
      };
      u.entries = u.entries.filter((entry) => {
        return new Int(entry.balance).gt(new Int(0));
      });
      res.push(u);
    }

    return res;
  }
}

export class ObservableQueryUnbondingDelegations extends ObservableChainQueryMap<UnbondingDelegations> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryUnbondingDelegationsInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getQueryBech32Address(
    bech32Address: string
  ): ObservableQueryUnbondingDelegationsInner {
    return this.get(bech32Address) as ObservableQueryUnbondingDelegationsInner;
  }
}
