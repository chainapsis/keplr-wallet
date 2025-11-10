import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Delegation, Delegations } from "./types";
import { ChainGetter } from "../../../chain";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { QuerySharedContext } from "../../../common";

export class ObservableQueryDelegationsInner extends ObservableChainQuery<Delegations> {
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
      `/cosmos/staking/v1beta1/delegations/${bech32Address}?pagination.limit=1000`
    );
    makeObservable(this);

    this.bech32Address = bech32Address;
  }

  protected override canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return (
      this.bech32Address.length > 0 ||
      this.chainGetter.getModularChainInfoImpl(this.chainId).stakeCurrency !=
        null
    );
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
    for (const delegation of this.response.data.delegation_responses) {
      const amount = new Int(delegation.balance.amount);
      if (amount.gt(new Int(0))) {
        totalBalance = totalBalance.add(amount);
      }
    }

    return new CoinPretty(stakeCurrency, totalBalance);
  }

  @computed
  get delegationBalances(): {
    validatorAddress: string;
    balance: CoinPretty;
  }[] {
    if (!this.response) {
      return [];
    }

    const stakeCurrency = this.chainGetter.getModularChainInfoImpl(
      this.chainId
    ).stakeCurrency;

    if (!stakeCurrency) {
      return [];
    }

    const result = [];

    for (const delegation of this.response.data.delegation_responses) {
      const balance = new CoinPretty(
        stakeCurrency,
        new Int(delegation.balance.amount)
      );
      if (balance.toDec().gt(new Dec(0))) {
        result.push({
          validatorAddress: delegation.delegation.validator_address,
          balance,
        });
      }
    }

    return result;
  }

  @computed
  get delegations(): Delegation[] {
    if (!this.response) {
      return [];
    }

    return this.response.data.delegation_responses.filter((del) => {
      return new Int(del.balance.amount).gt(new Int(0));
    });
  }

  readonly getDelegationTo = computedFn(
    (validatorAddress: string): CoinPretty | undefined => {
      const delegations = this.delegations;

      const stakeCurrency = this.chainGetter.getModularChainInfoImpl(
        this.chainId
      ).stakeCurrency;

      if (!stakeCurrency) {
        return;
      }

      if (!this.response) {
        return new CoinPretty(stakeCurrency, new Int(0)).ready(false);
      }

      for (const delegation of delegations) {
        if (delegation.delegation.validator_address === validatorAddress) {
          return new CoinPretty(
            stakeCurrency,
            new Int(delegation.balance.amount)
          );
        }
      }

      return new CoinPretty(stakeCurrency, new Int(0));
    }
  );
}

export class ObservableQueryDelegations extends ObservableChainQueryMap<Delegations> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryDelegationsInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getQueryBech32Address(
    bech32Address: string
  ): ObservableQueryDelegationsInner {
    return this.get(bech32Address) as ObservableQueryDelegationsInner;
  }
}
