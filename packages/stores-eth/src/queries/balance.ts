import { DenomHelper } from "@keplr-wallet/common";
import {
  BalanceRegistry,
  ChainGetter,
  IObservableQueryBalanceImpl,
  ObservableJsonRPCQuery,
  QueryResponse,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { EthereumAccountBase } from "../account";
import { ankrSupportedChainIdMap } from "../constants";
import { AnkrTokenBalance } from "../types";

export class ObservableQueryEthAccountBalanceImpl
  extends ObservableJsonRPCQuery<AnkrTokenBalance | string>
  implements IObservableQueryBalanceImpl
{
  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly ethereumURL: string,
    protected readonly ethereumHexAddress: string,
    protected readonly thirdpartyEndpoint: string
  ) {
    const isThirdpartySupported = Object.keys(ankrSupportedChainIdMap).includes(
      chainId
    );

    super(
      sharedContext,
      isThirdpartySupported ? thirdpartyEndpoint : ethereumURL,
      "",
      isThirdpartySupported ? "ankr_getAccountBalance" : "eth_getBalance",
      isThirdpartySupported
        ? {
            blockchain: ankrSupportedChainIdMap[chainId],
            walletAddress: ethereumHexAddress,
            // This option make native network token first in array of response data.
            nativeFirst: true,
          }
        : [ethereumHexAddress, "latest"]
    );

    makeObservable(this);
  }

  protected override onReceiveResponse(
    response: Readonly<QueryResponse<AnkrTokenBalance | string>>
  ) {
    super.onReceiveResponse(response);

    const isThirdpartySupported = Object.keys(ankrSupportedChainIdMap).includes(
      this.chainId
    );
    // If the response is from thirdparty, it makes to initiate getting ERC20 balances.
    if (isThirdpartySupported && typeof response.data !== "string") {
      const chainInfo = this.chainGetter.getChain(this.chainId);

      const erc20Currencies = response?.data.assets
        .filter((asset) => !!asset.contractAddress)
        .map((asset) => ({
          coinMinimalDenom: `erc20:${asset.contractAddress}`,
          coinDecimals: parseInt(asset.tokenDecimals),
          coinDenom: asset.tokenSymbol,
          coinImageUrl: asset.thumbnail,
        }));

      if (erc20Currencies) {
        chainInfo.addCurrencies(...erc20Currencies);
      }
    }
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
      new Int(
        BigInt(
          // If the response data is string, it means that the data is from EVM endpoint not thirdparty.
          typeof this.response.data === "string"
            ? this.response.data
            : this.response.data.assets[0].balanceRawInteger
        )
      )
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
  constructor(
    protected readonly sharedContext: QuerySharedContext,
    protected readonly thirdpartyEndpoint: string
  ) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter<ChainInfo>,
    address: string,
    minimalDenom: string
  ): IObservableQueryBalanceImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    const chainInfo = chainGetter.getChain(chainId);
    const isHexAddress =
      EthereumAccountBase.isEthereumHexAddressWithChecksum(address);
    if (denomHelper.type !== "native" || !isHexAddress || !chainInfo.evm) {
      return;
    }

    return new ObservableQueryEthAccountBalanceImpl(
      this.sharedContext,
      chainId,
      chainGetter,
      denomHelper,
      chainInfo.evm.rpc,
      address,
      this.thirdpartyEndpoint
    );
  }
}
