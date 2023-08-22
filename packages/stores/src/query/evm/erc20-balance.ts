import { computed, makeObservable, override } from "mobx";
import { DenomHelper, KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableJsonRPCQuery,
  erc20MetadataInterface,
} from "../../common";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { BalanceRegistry, ObservableQueryBalanceInner } from "../balances";
import { Bech32Address } from "@keplr-wallet/cosmos";
import Axios from "axios";
import { BigNumber } from "@ethersproject/bignumber";

export class ObservableQueryErc20Balance extends ObservableJsonRPCQuery<string> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly bech32Address: string,
    protected readonly contractAddress: string
  ) {
    super(
      kvStore,
      Axios.create({
        ...{
          baseURL: chainGetter.getChain(chainId).rpc,
        },
      }),
      "",
      "eth_call",
      [
        {
          to: contractAddress,
          data: erc20MetadataInterface.encodeFunctionData("balanceOf", [
            bech32Address
              ? Bech32Address.fromBech32(
                  bech32Address,
                  chainGetter.getChain(chainId).bech32Config.bech32PrefixAccAddr
                ).toHex(true)
              : "0x0000000000000000000000000000000000000000",
          ]),
        },
        "latest",
      ]
    );
  }

  protected override canFetch(): boolean {
    return super.canFetch() && this.bech32Address !== "";
  }
}

export class ObservableQueryErc20BalanceInner extends ObservableQueryBalanceInner {
  protected readonly queryErc20Balance: ObservableQueryErc20Balance;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    denomHelper: DenomHelper,
    protected readonly evmAddress: string
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

    this.queryErc20Balance = new ObservableQueryErc20Balance(
      kvStore,
      chainId,
      chainGetter,
      evmAddress,
      denomHelper.contractAddress
    );
  }

  // This method doesn't have the role because the fetching is actually exeucnted in the `ObservableQueryErc20Balance`.
  protected override canFetch(): boolean {
    return false;
  }

  @override
  override *fetch() {
    yield this.queryErc20Balance.fetch();
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
      !this.queryErc20Balance.response ||
      !this.queryErc20Balance.response.data
    ) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(
      currency,
      BigNumber.from(this.queryErc20Balance.response.data).toBigInt()
    );
  }
}

export class ObservableQueryErc20BalanceRegistry implements BalanceRegistry {
  constructor(protected readonly kvStore: KVStore) {}

  getBalanceInner(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): ObservableQueryBalanceInner | undefined {
    const denomHelper = new DenomHelper(minimalDenom);

    if (denomHelper.type !== "erc20") {
      return;
    }

    return new ObservableQueryErc20BalanceInner(
      this.kvStore,
      chainId,
      chainGetter,
      denomHelper,
      bech32Address
    );
  }
}
