import { DenomHelper } from "@keplr-wallet/common";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";
import {
  BalanceRegistry,
  ChainGetter,
  IObservableQueryBalanceImpl,
  ObservableJsonRPCQuery,
  QueryError,
  QueryResponse,
  QuerySharedContext,
} from "@keplr-wallet/stores";
import { EthereumAccountBase } from "../account";

const thirdparySupportedChainIdMap: Record<string, string> = {
  "eip155:1": "eth",
  "eip155:10": "opt",
  "eip155:137": "polygon",
  "eip155:8453": "base",
  "eip155:42161": "arb",
};

interface ThirdpartyERC20TokenBalance {
  address: string;
  tokenBalances: {
    contractAddress: string;
    tokenBalance: string | null;
    error: {
      code: number;
      message: string;
    } | null;
  }[];
  // TODO: Support pagination.
  pageKey: string;
}

export class ObservableQueryThirdpartyERC20BalancesImplParent extends ObservableJsonRPCQuery<ThirdpartyERC20TokenBalance> {
  // XXX: See comments below.
  //      The reason why this field is here is that I don't know if it's mobx's bug or intention,
  //      but fetch can be executed twice by observation of parent and child by `onBecomeObserved`,
  //      so fetch should not be overridden in this parent class.
  public duplicatedFetchResolver?: Promise<void>;

  constructor(
    sharedContext: QuerySharedContext,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly ethereumHexAddress: string
  ) {
    const tokenAPIURL = `https://evm-${chainId.replace(
      "eip155:",
      ""
    )}.keplr.app/api`;
    super(sharedContext, tokenAPIURL, "", "alchemy_getTokenBalances", [
      ethereumHexAddress,
      "erc20",
      {
        // TODO: Support pagination.
        // The maximum count of token balances is 100.
        maxCount: 100,
      },
    ]);

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    // If ethereum hex address is empty, it will always fail, so don't need to fetch it.
    return (
      this.ethereumHexAddress.length > 0 &&
      thirdparySupportedChainIdMap[this.chainId] != null
    );
  }

  protected override onReceiveResponse(
    response: Readonly<QueryResponse<ThirdpartyERC20TokenBalance>>
  ) {
    super.onReceiveResponse(response);

    const chainInfo = this.chainGetter.getModularChainInfoImpl(this.chainId);
    const erc20Denoms = response.data.tokenBalances
      .filter(
        (tokenBalance) =>
          tokenBalance.tokenBalance != null &&
          BigInt(tokenBalance.tokenBalance) > 0
      )
      .map((tokenBalance) => `erc20:${tokenBalance.contractAddress}`);

    if (erc20Denoms.length) {
      chainInfo.addUnknownDenoms({
        module: "evm",
        coinMinimalDenoms: erc20Denoms,
      });
    }
  }
}

export class ObservableQueryThirdpartyERC20BalancesImpl
  implements IObservableQueryBalanceImpl
{
  constructor(
    protected readonly parent: ObservableQueryThirdpartyERC20BalancesImplParent,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly denomHelper: DenomHelper
  ) {
    makeObservable(this);
  }

  @computed
  get balance(): CoinPretty {
    const currency = this.currency;

    if (!this.response) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    const tokenBalance = this.response.data.tokenBalances.find(
      (bal) =>
        DenomHelper.normalizeDenom(`erc20:${bal.contractAddress}`) ===
        DenomHelper.normalizeDenom(this.denomHelper.denom)
    );
    if (tokenBalance?.tokenBalance == null) {
      return new CoinPretty(currency, new Int(0)).ready(false);
    }

    return new CoinPretty(currency, new Int(BigInt(tokenBalance.tokenBalance)));
  }

  @computed
  get currency(): AppCurrency {
    const denom = this.denomHelper.denom;

    return this.chainGetter
      .getModularChainInfoImpl(this.chainId)
      .forceFindCurrency(denom);
  }

  get error(): Readonly<QueryError<unknown>> | undefined {
    return this.parent.error;
  }
  get isFetching(): boolean {
    return this.parent.isFetching;
  }
  get isObserved(): boolean {
    return this.parent.isObserved;
  }
  get isStarted(): boolean {
    return this.parent.isStarted;
  }
  get response():
    | Readonly<QueryResponse<ThirdpartyERC20TokenBalance>>
    | undefined {
    return this.parent.response;
  }

  fetch(): Promise<void> {
    // XXX: The ERC20 balances via thirdparty token API can share the result of one endpoint.
    //      This class is implemented for this optimization.
    //      But the problem is that the query store can't handle these process properly right now.
    //      Currently, this is the only use-case,
    //      so We'll manually implement this here.
    //      In the case of fetch(), even if it is executed multiple times,
    //      the actual logic should be processed only once.
    //      So some sort of debouncing is needed.
    if (!this.parent.duplicatedFetchResolver) {
      this.parent.duplicatedFetchResolver = new Promise<void>(
        (resolve, reject) => {
          (async () => {
            try {
              await this.parent.fetch();
              this.parent.duplicatedFetchResolver = undefined;
              resolve();
            } catch (e) {
              this.parent.duplicatedFetchResolver = undefined;
              reject(e);
            }
          })();
        }
      );
      return this.parent.duplicatedFetchResolver;
    }

    return this.parent.duplicatedFetchResolver;
  }

  async waitFreshResponse(): Promise<
    Readonly<QueryResponse<unknown>> | undefined
  > {
    return await this.parent.waitFreshResponse();
  }

  async waitResponse(): Promise<Readonly<QueryResponse<unknown>> | undefined> {
    return await this.parent.waitResponse();
  }
}

export class ObservableQueryThirdpartyERC20BalanceRegistry
  implements BalanceRegistry
{
  protected parentMap: Map<
    string,
    ObservableQueryThirdpartyERC20BalancesImplParent
  > = new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter,
    address: string,
    minimalDenom: string
  ): ObservableQueryThirdpartyERC20BalancesImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    const modularChainInfoImpl = chainGetter.getModularChainInfoImpl(chainId);
    const isHexAddress =
      EthereumAccountBase.isEthereumHexAddressWithChecksum(address);
    if (
      !Object.keys(thirdparySupportedChainIdMap).includes(chainId) ||
      denomHelper.type !== "erc20" ||
      !isHexAddress ||
      !("evm" in modularChainInfoImpl.embedded)
    ) {
      return;
    }
    const key = `${chainId}/${address}`;

    if (!this.parentMap.has(key)) {
      this.parentMap.set(
        key,
        new ObservableQueryThirdpartyERC20BalancesImplParent(
          this.sharedContext,
          chainId,
          chainGetter,
          address
        )
      );
    }

    return new ObservableQueryThirdpartyERC20BalancesImpl(
      this.parentMap.get(key)!,
      chainId,
      chainGetter,
      denomHelper
    );
  }
}
