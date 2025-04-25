import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { Delegation, InitiaDelegations } from "./types";
import { ChainGetter } from "../../../chain";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { QuerySharedContext } from "../../../common";
import { Coin } from "@keplr-wallet/types";

export class ObservableQueryInitiaDelegationsInner extends ObservableChainQuery<InitiaDelegations> {
  protected bech32Address: string;
  protected isInitia = this.chainId === "interwoven-1";

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
      `/initia/mstaking/v1/delegations/${bech32Address}`
    );
    makeObservable(this);

    this.bech32Address = bech32Address;
  }

  protected override canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return (
      this.bech32Address.length > 0 ||
      this.chainGetter.getChain(this.chainId).stakeCurrency != null
    );
  }

  // a function to extract amount from delegation balance
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
    for (const delegation of this.response.data.delegation_responses) {
      const amount = this.getAmountFromBalanceArray(delegation.balance);

      const amountInt = new Int(amount);
      if (amountInt.gt(new Int(0))) {
        totalBalance = totalBalance.add(amountInt);
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

    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    if (!stakeCurrency) {
      return [];
    }

    const result = [];

    for (const delegation of this.response.data.delegation_responses) {
      const amount = this.getAmountFromBalanceArray(delegation.balance);

      const balance = new CoinPretty(stakeCurrency, new Int(amount));

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

    const stakeCurrency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    return this.response.data.delegation_responses
      .filter((del) => {
        const amount = this.getAmountFromBalanceArray(del.balance);
        return new Int(amount).gt(new Int(0));
      })
      .map((del) => {
        return {
          ...del,
          balance: {
            denom: stakeCurrency?.coinMinimalDenom,
            amount: this.getAmountFromBalanceArray(del.balance),
          },
        } as Delegation;
      });
  }

  readonly getDelegationTo = computedFn(
    (validatorAddress: string): CoinPretty | undefined => {
      const delegations = this.delegations;

      const stakeCurrency = this.chainGetter.getChain(
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

export class ObservableQueryInitiaDelegations extends ObservableChainQueryMap<InitiaDelegations> {
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter
  ) {
    super(sharedContext, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryInitiaDelegationsInner(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getQueryBech32Address(
    bech32Address: string
  ): ObservableQueryInitiaDelegationsInner {
    return this.get(bech32Address) as ObservableQueryInitiaDelegationsInner;
  }
}
