import {
  ChainGetter,
  IObservableQueryBalanceImpl,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { DenomHelper } from "@keplr-wallet/common";
import { ObservableStarknetChainJsonRpcQuery } from "./starknet-chain-json-rpc";
import { CairoUint256 } from "starknet";

export class ObservableQueryStarknetERC20BalanceImpl
  extends ObservableStarknetChainJsonRpcQuery<string[]>
  implements IObservableQueryBalanceImpl
{
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly starknetHexAddress: string,
    protected readonly contractAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "starknet_call", {
      request: {
        contract_address: contractAddress,
        calldata: [starknetHexAddress],
        // selector.getSelectorFromName("balanceOf")
        entry_point_selector:
          "0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e",
      },
    });

    makeObservable(this);
  }

  @computed
  get balance(): CoinPretty {
    const currency = this.currency;

    if (!this.response || !this.response.data) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(
      currency,
      new Int(
        new CairoUint256({
          low: this.response.data[0],
          high: this.response.data[1],
        }).toBigInt()
      )
    );
  }

  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    const modularChainInfo = this.chainGetter.getModularChain(this.chainId);
    if (!("starknet" in modularChainInfo)) {
      throw new Error(`The chain (${this.chainId}) doesn't support starknet`);
    }
    const modularChainInfoImpl = this.chainGetter.getModularChainInfoImpl(
      this.chainId
    );

    const currency = modularChainInfoImpl
      .getCurrenciesByModule("starknet")
      .find((cur) => cur.coinMinimalDenom === denom);

    if (!currency) {
      throw new Error(`Unknown currency: ${this.contractAddress}`);
    }

    return currency;
  }
}

export class ObservableQueryStarknetERC20Balance {
  protected map: Map<string, ObservableQueryStarknetERC20BalanceImpl> =
    new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalance(
    chainId: string,
    chainGetter: ChainGetter<ChainInfo>,
    address: string,
    minimalDenom: string
  ): IObservableQueryBalanceImpl | undefined {
    const key = `${chainId}/${address}/${minimalDenom}`;
    const prior = this.map.get(key);
    if (prior) {
      return prior;
    }

    const denomHelper = new DenomHelper(minimalDenom);
    const modularChainInfo = chainGetter.getModularChain(chainId);
    if (denomHelper.type !== "erc20" || !("starknet" in modularChainInfo)) {
      return;
    }

    const impl = new ObservableQueryStarknetERC20BalanceImpl(
      this.sharedContext,
      chainId,
      chainGetter,
      denomHelper,
      address,
      denomHelper.contractAddress
    );
    this.map.set(key, impl);
    return impl;
  }
}
