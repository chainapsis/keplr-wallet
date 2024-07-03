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
import bigInteger from "big-integer";
import { EthereumAccountBase } from "../account";
import { ankrSupportedChainIdMap } from "../constants";
import { ObservableQueryThirdpartyERC20BalancesImplParent } from "./erc20-balances";

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

  protected override onReceiveResponse(
    response: Readonly<QueryResponse<string>>
  ) {
    super.onReceiveResponse(response);

    if (Object.values(ankrSupportedChainIdMap).includes(this.chainId)) {
      const impleParent = new ObservableQueryThirdpartyERC20BalancesImplParent(
        this.sharedContext,
        this.chainId,
        this.chainGetter,
        this.ethereumeHexAddress
      );
      const chainInfo = this.chainGetter.getChain(this.chainId);

      impleParent.waitResponse().then((response) => {
        const erc20Currencies = response?.data.assets
          .filter(
            (asset) =>
              asset.contractAddress &&
              ankrSupportedChainIdMap[asset.blockchain] === this.chainId
          )
          .map((asset) => ({
            coinMinimalDenom: `erc20:${asset.contractAddress}`,
            coinDecimals: parseInt(asset.tokenDecimals),
            coinDenom: asset.tokenSymbol,
            coinImageUrl: asset.thumbnail,
          }));
        if (erc20Currencies) {
          chainInfo.addCurrencies(...erc20Currencies);
        }
      });
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
      address
    );
  }
}
