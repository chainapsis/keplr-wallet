import { computed, makeObservable, override } from "mobx";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { ChainGetter, QueryResponse } from "../../common";
import { ObservableQuerySecretContractCodeHash } from "./contract-hash";
import { QueryError } from "../../common";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { BalanceRegistry, ObservableQueryBalanceInner } from "../balances";
import { ObservableSecretContractChainQuery } from "./contract-query";
import { CancelToken } from "axios";
import { WrongViewingKeyError } from "./errors";
import { Keplr } from "@keplr-wallet/types";

export class ObservableQuerySecret20Balance extends ObservableSecretContractChainQuery<{
  balance: { amount: string };
  ["viewing_key_error"]?: {
    msg: string;
  };
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly apiGetter: () => Promise<Keplr | undefined>,
    protected readonly contractAddress: string,
    protected readonly bech32Address: string,
    protected readonly parent: ObservableQuerySecret20BalanceInner,
    protected readonly querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      apiGetter,
      contractAddress,
      {},
      querySecretContractCodeHash
    );
    makeObservable(this);

    if (!this.viewingKey) {
      this.setError({
        status: 0,
        statusText: "Viewing key is empty",
        message: "Viewing key is empty",
      });
    } else {
      this.setObj({
        balance: { address: bech32Address, key: this.viewingKey },
      });
    }
  }

  @computed
  get viewingKey(): string {
    const currency = this.parent.currency;
    if ("type" in currency && currency.type === "secret20") {
      return currency.viewingKey;
    }

    return "";
  }

  protected canFetch(): boolean {
    return (
      super.canFetch() && this.bech32Address !== "" && this.viewingKey !== ""
    );
  }

  protected async fetchResponse(
    cancelToken: CancelToken
  ): Promise<QueryResponse<{ balance: { amount: string } }>> {
    const result = await super.fetchResponse(cancelToken);

    if (result.data["viewing_key_error"]) {
      throw new WrongViewingKeyError(result.data["viewing_key_error"]?.msg);
    }

    return result;
  }
}

export class ObservableQuerySecret20BalanceInner extends ObservableQueryBalanceInner {
  protected readonly querySecret20Balance: ObservableQuerySecret20Balance;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly apiGetter: () => Promise<Keplr | undefined>,
    denomHelper: DenomHelper,
    protected readonly bech32Address: string,
    protected readonly querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      // No need to set the url at initial.
      "",
      denomHelper
    );

    makeObservable(this);

    this.querySecret20Balance = new ObservableQuerySecret20Balance(
      kvStore,
      chainId,
      chainGetter,
      this.apiGetter,
      denomHelper.contractAddress,
      bech32Address,
      this,
      this.querySecretContractCodeHash
    );
  }

  // This method doesn't have the role because the fetching is actually exeucnted in the `ObservableQuerySecret20Balance`.
  protected canFetch(): boolean {
    return false;
  }

  @override
  *fetch() {
    yield this.querySecret20Balance.fetch();
  }

  get isFetching(): boolean {
    return (
      this.querySecretContractCodeHash.getQueryContract(
        this.denomHelper.contractAddress
      ).isFetching || this.querySecret20Balance.isFetching
    );
  }

  get error(): Readonly<QueryError<unknown>> | undefined {
    return (
      this.querySecretContractCodeHash.getQueryContract(
        this.denomHelper.contractAddress
      ).error || this.querySecret20Balance.error
    );
  }

  @computed
  get balance(): CoinPretty {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const currency = chainInfo.findCurrency(denom);

    // TODO: Infer the currency according to its denom (such if denom is `uatom` -> `Atom` with decimal 6)?
    if (!currency) {
      throw new Error(`Unknown currency: ${denom}`);
    }

    if (
      !this.querySecret20Balance.response ||
      !this.querySecret20Balance.response.data.balance
    ) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(
      currency,
      new Int(this.querySecret20Balance.response.data.balance.amount)
    );
  }
}

export class ObservableQuerySecret20BalanceRegistry implements BalanceRegistry {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly apiGetter: () => Promise<Keplr | undefined>,
    protected readonly querySecretContractCodeHash: ObservableQuerySecretContractCodeHash
  ) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type === "secret20") {
      return new ObservableQuerySecret20BalanceInner(
        this.kvStore,
        chainId,
        chainGetter,
        this.apiGetter,
        denomHelper,
        bech32Address,
        this.querySecretContractCodeHash
      );
    }
  }
}
