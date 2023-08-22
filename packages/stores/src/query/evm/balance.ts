import { computed, makeObservable, override } from "mobx";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableJsonRPCQuery } from "../../common";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { BalanceRegistry, ObservableQueryBalanceInner } from "../balances";
import { Bech32Address } from "@keplr-wallet/cosmos";
import Axios from "axios";
import { BigNumber } from "@ethersproject/bignumber";

export class ObservableQueryEvmNativeBalance extends ObservableJsonRPCQuery<string> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly bech32Address: string
  ) {
    super(
      kvStore,
      Axios.create({
        ...{
          baseURL: chainGetter.getChain(chainId).rpc,
        },
      }),
      "",
      "eth_getBalance",
      [
        bech32Address
          ? Bech32Address.fromBech32(
              bech32Address,
              chainGetter.getChain(chainId).bech32Config.bech32PrefixAccAddr
            ).toHex(true)
          : "0x0000000000000000000000000000000000000000",
        "latest",
      ]
    );
  }

  protected override canFetch(): boolean {
    return super.canFetch() && this.bech32Address !== "";
  }
}

export class ObservableQueryEvmNativeBalanceInner extends ObservableQueryBalanceInner {
  protected readonly queryNativeBalance: ObservableQueryEvmNativeBalance;

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
      // No need to set the url at initial.
      "",
      denomHelper
    );

    makeObservable(this);

    this.queryNativeBalance = new ObservableQueryEvmNativeBalance(
      kvStore,
      chainId,
      chainGetter,
      bech32Address
    );
  }

  // This method doesn't have the role because the fetching is actually exeucnted in the `ObservableQueryCw20Balance`.
  protected override canFetch(): boolean {
    return false;
  }

  override get isFetching(): boolean {
    return this.queryNativeBalance.isFetching;
  }

  override get error() {
    return this.queryNativeBalance.error;
  }

  override get response() {
    return this.queryNativeBalance.response;
  }

  @override
  override *fetch() {
    yield this.queryNativeBalance.fetch();
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

    if (
      !this.queryNativeBalance.response ||
      !this.queryNativeBalance.response.data
    ) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(
      currency,
      BigNumber.from(this.queryNativeBalance.response.data).toBigInt()
    );
  }
}

export class ObservableQueryEvmNativeBalanceRegistry
  implements BalanceRegistry
{
  constructor(protected readonly kvStore: KVStore) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    const isEvm =
      chainGetter.getChain(chainId).features?.includes("evm") ?? false;

    if (!(isEvm && denomHelper.type === "native")) {
      return;
    }

    return new ObservableQueryEvmNativeBalanceInner(
      this.kvStore,
      chainId,
      chainGetter,
      denomHelper,
      bech32Address
    );
  }
}
