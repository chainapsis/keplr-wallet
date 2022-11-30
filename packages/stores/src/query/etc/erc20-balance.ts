import { computed, makeObservable, override } from "mobx";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { ChainGetter } from "../../common";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { BalanceRegistry, ObservableQueryBalanceInner } from "../balances";
import { ObservableQueryERC20ContractData } from "./erc20/query";
import { Bech32Address } from "@keplr-wallet/cosmos";

export class ObservableQueryERC20BalanceInner extends ObservableQueryBalanceInner {
  protected readonly queryErc20Balance: ObservableQueryERC20ContractData;

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

    const ethereumUrl = chainGetter.getChain(chainId).ethereumJsonRpc ?? "";
    let userAddress = "";
    try {
      userAddress = Bech32Address.fromBech32(
        this.bech32Address,
        this.chainGetter.getChain(this.chainId).bech32Config.bech32PrefixAccAddr
      ).toHex(true);
    } catch (e) {}

    this.queryErc20Balance = new ObservableQueryERC20ContractData(
      kvStore,
      ethereumUrl,
      userAddress
    );
  }

  // This method doesn't have the role because the fetching is executed by queryErc20Balance
  protected canFetch(): boolean {
    return false;
  }

  @override
  *fetch() {
    yield this.queryErc20Balance.get(this.denomHelper.contractAddress);
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

    const balance = this.queryErc20Balance.get(this.denomHelper.contractAddress)
      .balance;

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
