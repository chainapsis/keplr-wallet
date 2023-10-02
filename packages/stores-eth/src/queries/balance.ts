import { DenomHelper } from "@keplr-wallet/common";
import {
  BalanceRegistry,
  ChainGetter,
  IObservableQueryBalanceImpl,
  ObservableJsonRPCQuery,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import bigInteger from "big-integer";

export class ObservableQueryEthAccountBalanceImpl
  extends ObservableJsonRPCQuery<string>
  implements IObservableQueryBalanceImpl
{
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly ethereumURL: string,
    protected readonly ethereumeHexAddress: string
  ) {
    super(sharedContext, ethereumURL, "", "eth_getBalance", [
      ethereumeHexAddress,
      "latest",
    ]);
    makeObservable(this);
  }

  @computed
  get balance(): CoinPretty {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const currency = chainInfo.currencies.find(
      (cur) => cur.coinMinimalDenom === denom
    );

    if (!currency) {
      throw new Error(`Unknown currency: ${denom}`);
    }

    if (!this.response || !this.response.data) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(
      currency,
      new Int(bigInteger(this.response.data.replace("0x", ""), 16).toString())
    );
  }

  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getChain(this.chainId);
    return chainInfo.forceFindCurrency(denom);
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
    const chainInfo = chainGetter.getChain(chainId);
    if (denomHelper.type !== "native" || !chainInfo.evm) {
      return;
    }

    return new ObservableQueryEthAccountBalanceImpl(
      this.sharedContext,
      chainId,
      chainGetter,
      denomHelper,
      chainInfo.evm.rpc,
      address
    );
  }
}
