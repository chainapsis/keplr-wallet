import { computed, makeObservable, override } from "mobx";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../common";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { BalanceRegistry, ObservableQueryBalanceInner } from "../balances";
import { ObservableQueryERC20ContractBalance } from "./balance-query";

export class ObservableQueryERC20Balance extends ObservableQueryERC20ContractBalance {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly contractAddress: string,
    protected readonly bech32Address: string
  ) {
    super(kvStore, chainId, chainGetter, contractAddress, bech32Address);
  }

  get balance() {
    return this.queryContractBalance.balance;
  }

  protected canFetch(): boolean {
    return this.bech32Address !== "";
  }

  fetch() {
    this.queryContractBalance.fetch();
  }

  get isFetching() {
    return this.queryContractBalance.isFetching;
  }
}

export class ObservableQueryERC20BalanceInner extends ObservableQueryBalanceInner {
  protected readonly queryERC20Balance: ObservableQueryERC20Balance;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly bech32Address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      // Skip URL
      "",
      denomHelper
    );

    // Skip super methods
    makeObservable(this);

    this.queryERC20Balance = new ObservableQueryERC20Balance(
      kvStore,
      chainId,
      chainGetter,
      denomHelper.contractAddress,
      bech32Address
    );
  }

  // This method doesn't have the role because the fetching is executed by queryERC20Balance
  protected canFetch(): boolean {
    return false;
  }

  get isFetching(): boolean {
    return this.queryERC20Balance.isFetching;
  }

  @override
  *fetch() {
    yield this.queryERC20Balance.fetch();
  }

  @computed
  get balance(): CoinPretty {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const currency = chainInfo.currencies.find(
      (cur) => cur.coinMinimalDenom === denom
    );

    // TODO: Infer the currency according to its denom (such if denom is `uatom` -> `Atom` with decimal 6)?
    if (!currency) {
      throw new Error(`Unknown currency: ${denom}`);
    }

    const balance = this.queryERC20Balance.balance;

    if (!balance) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(currency, new Int(balance));
  }
}

export class ObservableQueryERC20BalanceRegistry implements BalanceRegistry {
  constructor(protected readonly kvStore: KVStore) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type === "erc20") {
      return new ObservableQueryERC20BalanceInner(
        this.kvStore,
        chainId,
        chainGetter,
        denomHelper,
        bech32Address
      );
    }
  }
}
