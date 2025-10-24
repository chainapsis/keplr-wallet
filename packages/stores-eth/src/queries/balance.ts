import { DenomHelper } from "@keplr-wallet/common";
import {
  BalanceRegistry,
  ChainGetter,
  IObservableQueryBalanceImpl,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { EthereumAccountBase } from "../account";
import { ObservableEvmChainJsonRpcQuery } from "./evm-chain-json-rpc";

export class ObservableQueryEthAccountBalanceImpl
  extends ObservableEvmChainJsonRpcQuery<string>
  implements IObservableQueryBalanceImpl
{
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly ethereumHexAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "eth_getBalance", [
      ethereumHexAddress,
      "latest",
    ]);

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    // If ethereum hex address is empty, it will always fail, so don't need to fetch it.
    return this.ethereumHexAddress.length > 0;
  }

  @computed
  get balance(): CoinPretty {
    const denom = this.denomHelper.denom;
    const modularChainInfoImpl = this.chainGetter.getModularChainInfoImpl(
      this.chainId
    );
    const currency = modularChainInfoImpl
      .getCurrencies()
      .find((cur) => cur.coinMinimalDenom === denom);
    if (!currency) {
      throw new Error(`Unknown currency: ${denom}`);
    }

    if (!this.response || !this.response.data) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(currency, new Int(BigInt(this.response.data)));
  }

  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    return this.chainGetter
      .getModularChainInfoImpl(this.chainId)
      .forceFindCurrency(denom);
  }
}
export class ObservableQueryEthAccountBalanceRegistry
  implements BalanceRegistry
{
  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter<ChainInfo>,
    address: string,
    minimalDenom: string
  ): IObservableQueryBalanceImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    const chainInfo = chainGetter.getModularChain(chainId);
    const isHexAddress =
      EthereumAccountBase.isEthereumHexAddressWithChecksum(address);
    if (
      denomHelper.type !== "native" ||
      !isHexAddress ||
      !("evm" in chainInfo && chainInfo.evm != null)
    ) {
      return;
    }

    return new ObservableQueryEthAccountBalanceImpl(
      this.sharedContext,
      chainId,
      chainGetter,
      denomHelper,
      address
    );
  }
}
