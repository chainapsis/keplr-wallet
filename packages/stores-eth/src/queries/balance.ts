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
import { ObservableQueryThirdpartyERC20BalancesImplParent } from "./erc20-balances";
import { thirdparySupportedChainIdMap } from "../constants";

export class ObservableQueryEthAccountBalanceImpl
  extends ObservableJsonRPCQuery<string>
  implements IObservableQueryBalanceImpl
{
  protected readonly _queryThirdpartyERC20Balances:
    | ObservableQueryThirdpartyERC20BalancesImplParent
    | undefined = undefined;

  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper,
    protected readonly ethereumURL: string,
    protected readonly ethereumHexAddress: string
  ) {
    super(sharedContext, ethereumURL, "", "eth_getBalance", [
      ethereumHexAddress,
      "latest",
    ]);

    if (Object.keys(thirdparySupportedChainIdMap).includes(this.chainId)) {
      this._queryThirdpartyERC20Balances =
        new ObservableQueryThirdpartyERC20BalancesImplParent(
          sharedContext,
          chainId,
          chainGetter,
          ethereumURL,
          ethereumHexAddress
        );
    }

    makeObservable(this);
  }

  protected override onReceiveResponse(
    response: Readonly<QueryResponse<string>>
  ) {
    super.onReceiveResponse(response);

    // If the response is from thirdparty, it makes to initiate getting ERC20 balances.
    if (this._queryThirdpartyERC20Balances != null) {
      this._queryThirdpartyERC20Balances.waitResponse().then((response) => {
        const chainInfo = this.chainGetter.getChain(this.chainId);

        const erc20Denoms = response?.data.tokenBalances
          .filter((tokenBalance) => tokenBalance.tokenBalance != null)
          .map((tokenBalance) => `erc20:${tokenBalance.contractAddress}`);
        if (erc20Denoms) {
          chainInfo.addUnknownDenoms(...erc20Denoms);
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

    return new CoinPretty(currency, new Int(BigInt(this.response.data)));
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
