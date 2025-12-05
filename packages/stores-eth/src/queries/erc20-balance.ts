import {
  BalanceRegistry,
  ChainGetter,
  IObservableQueryBalanceImpl,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import bigInteger from "big-integer";
import { erc20ContractInterface } from "../constants";
import { DenomHelper } from "@keplr-wallet/common";
import { EthereumAccountBase } from "../account";
import { ObservableEvmChainJsonRpcQuery } from "./evm-chain-json-rpc";

export class ObservableQueryEthereumERC20BalanceImpl
  extends ObservableEvmChainJsonRpcQuery<string>
  implements IObservableQueryBalanceImpl
{
  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly ethereumHexAddress: string,
    protected readonly contractAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "eth_call", [
      {
        to: contractAddress,
        data: erc20ContractInterface.encodeFunctionData("balanceOf", [
          ethereumHexAddress,
        ]),
      },
      "latest",
    ]);

    makeObservable(this);
  }

  @computed
  get balance(): CoinPretty {
    const denom = this.denomHelper.denom;

    const chainInfo = this.chainGetter.getModularChainInfoImpl(this.chainId);
    const currency = chainInfo
      .getCurrencies()
      .find((cur) => cur.coinMinimalDenom === denom);

    if (!currency) {
      throw new Error(`Unknown currency: ${this.contractAddress}`);
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

    return this.chainGetter
      .getModularChainInfoImpl(this.chainId)
      .forceFindCurrency(denom);
  }
}

export class ObservableQueryEthereumERC20BalanceRegistry
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
      denomHelper.type !== "erc20" ||
      !isHexAddress ||
      !("evm" in chainInfo && chainInfo.evm != null)
    ) {
      return;
    }

    return new ObservableQueryEthereumERC20BalanceImpl(
      this.sharedContext,
      chainId,
      chainGetter,
      denomHelper,
      address,
      denomHelper.contractAddress
    );
  }
}
