import {
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "../../chain-query";
import { KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../../common";
import { AuthAccount } from "./types";
import { computed, makeObservable } from "mobx";
import { BaseAccount } from "@keplr-wallet/cosmos";

export class ObservableQueryAccountInner extends ObservableChainQuery<AuthAccount> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly bech32Address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/cosmos/auth/v1beta1/accounts/${bech32Address}`
    );

    makeObservable(this);
  }

  @computed
  get sequence(): string {
    if (!this.response) {
      return "0";
    }

    // XXX: In launchpad, the status was 200 even if the account not exist.
    //      However, from stargate, the status becomes 404 if the account not exist.
    //      This case has not been dealt with yet.
    //      However, in the case of 404, it will be treated as an error, and in this case the sequence should be 0.

    try {
      const account = BaseAccount.fromProtoJSON(
        this.response.data,
        this.bech32Address
      );
      return account.getSequence().toString();
    } catch {
      return "0";
    }
  }

  @computed
  get isVestingAccount(): boolean {
    if (!this.response) {
      return false;
    }

    return !!this.response.data?.account.base_vesting_account;
  }
}

export class ObservableQueryAccount extends ObservableChainQueryMap<AuthAccount> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (bech32Address) => {
      return new ObservableQueryAccountInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  getQueryBech32Address(bech32Address: string): ObservableQueryAccountInner {
    return this.get(bech32Address) as ObservableQueryAccountInner;
  }
}
