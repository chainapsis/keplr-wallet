import { QueryError, QueryResponse, QuerySharedContext } from "../../common";
import { ObservableChainQueryJSONRPC } from "../chain-json-rpc-query";
import { ChainGetter } from "../../chain";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { BalanceRegistry, IObservableQueryBalanceImpl } from "../balances";
import { computed, makeObservable } from "mobx";
import { AppCurrency } from "@keplr-wallet/types";
import { DenomHelper } from "@keplr-wallet/common";

export interface EthereumBalanceResult {
  jsonrpc: "2.0";
  id: number;
  result: string;
}

export class ObservableQueryEthereumBalanceImplParent extends ObservableChainQueryJSONRPC<EthereumBalanceResult> {
  public duplicatedFetchResolver?: Promise<void>;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly ethereumAddress: string
  ) {
    super(sharedContext, chainId, chainGetter, "", {
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [ethereumAddress, "latest"],
      id: 1,
    });

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    // If ethereum address is empty, it will always fail, so don't need to fetch it.
    return this.ethereumAddress.length > 0;
  }
}

export class ObservableQueryEthereumBalanceImpl
  implements IObservableQueryBalanceImpl
{
  constructor(
    protected readonly parent: ObservableQueryEthereumBalanceImplParent,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {
    makeObservable(this);
  }

  @computed
  get currency(): AppCurrency {
    const chainInfo = this.chainGetter.getChain(this.chainId);
    if (!chainInfo.evm) {
      throw new Error("This chain doesn't support evm");
    }

    return chainInfo.evm.nativeCurrency;
  }

  @computed
  get balance(): CoinPretty {
    if (!this.response || !this.response.data.result) {
      return new CoinPretty(this.currency, new Int(0)).ready(false);
    }

    return new CoinPretty(
      this.currency,
      new Int(parseInt(this.response.data.result))
    );
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
  get response(): Readonly<QueryResponse<EthereumBalanceResult>> | undefined {
    return this.parent.response;
  }

  fetch(): Promise<void> {
    // XXX: The balances of ethereum can share the result of one endpoint.
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

export class ObservableQueryEthereumBalanceRegistry implements BalanceRegistry {
  protected parentMap: Map<string, ObservableQueryEthereumBalanceImplParent> =
    new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter,
    ethereumAddress: string,
    minimalDenom: string
  ): ObservableQueryEthereumBalanceImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type !== "native") {
      return;
    }

    const key = `${chainId}/${ethereumAddress}`;

    if (!this.parentMap.has(key)) {
      this.parentMap.set(
        key,
        new ObservableQueryEthereumBalanceImplParent(
          this.sharedContext,
          chainId,
          chainGetter,
          ethereumAddress
        )
      );
    }

    return new ObservableQueryEthereumBalanceImpl(
      this.parentMap.get(key)!,
      chainId,
      chainGetter
    );
  }
}
