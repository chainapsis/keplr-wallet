import { DenomHelper } from "@keplr-wallet/common";
import {
  QueryError,
  QueryResponse,
  QuerySharedContext,
  StoreUtils,
} from "../../../common";
import { ChainGetter } from "../../../chain";
import { computed, makeObservable } from "mobx";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { BalanceRegistry, IObservableQueryBalanceImpl } from "../../balances";
import { ObservableChainQuery } from "../../chain-query";
import { Balances } from "./types";
import { AppCurrency } from "@keplr-wallet/types";
import { Bech32Address } from "@keplr-wallet/cosmos";

export class ObservableQueryCosmosBalancesImplParent extends ObservableChainQuery<Balances> {
  // XXX: See comments below.
  //      The reason why this field is here is that I don't know if it's mobx's bug or intention,
  //      but fetch can be executed twice by observation of parent and child by `onBecomeObserved`,
  //      so fetch should not be overridden in this parent class.
  public duplicatedFetchResolver?: Promise<void>;

  constructor(
    sharedContext: QuerySharedContext,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly bech32Address: string
  ) {
    super(
      sharedContext,
      chainId,
      chainGetter,
      `/cosmos/bank/v1beta1/balances/${bech32Address}?pagination.limit=1000`
    );

    makeObservable(this);
  }

  protected override canFetch(): boolean {
    // If bech32 address is empty, it will always fail, so don't need to fetch it.
    return this.bech32Address.length > 0;
  }

  protected override onReceiveResponse(
    response: Readonly<QueryResponse<Balances>>
  ) {
    super.onReceiveResponse(response);

    const chainInfo = this.chainGetter.getModularChainInfoImpl(this.chainId);
    const denoms = response.data.balances.map((coin) => coin.denom);
    chainInfo.addUnknownDenoms({
      module: "cosmos",
      coinMinimalDenoms: denoms,
    });
  }
}

export class ObservableQueryCosmosBalancesImpl
  implements IObservableQueryBalanceImpl
{
  constructor(
    protected readonly parent: ObservableQueryCosmosBalancesImplParent,
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

    return StoreUtils.getBalanceFromCurrency(
      currency,
      this.response.data.balances
    );
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
  get response(): Readonly<QueryResponse<Balances>> | undefined {
    return this.parent.response;
  }

  fetch(): Promise<void> {
    // XXX: The balances of cosmos-sdk can share the result of one endpoint.
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

export class ObservableQueryCosmosBalanceRegistry implements BalanceRegistry {
  protected parentMap: Map<string, ObservableQueryCosmosBalancesImplParent> =
    new Map();

  constructor(protected readonly sharedContext: QuerySharedContext) {}

  getBalanceImpl(
    chainId: string,
    chainGetter: ChainGetter,
    bech32Address: string,
    minimalDenom: string
  ): ObservableQueryCosmosBalancesImpl | undefined {
    const denomHelper = new DenomHelper(minimalDenom);
    if (denomHelper.type !== "native") {
      return;
    }

    try {
      Bech32Address.validate(bech32Address);
    } catch {
      return;
    }

    const key = `${chainId}/${bech32Address}`;

    if (!this.parentMap.has(key)) {
      this.parentMap.set(
        key,
        new ObservableQueryCosmosBalancesImplParent(
          this.sharedContext,
          chainId,
          chainGetter,
          bech32Address
        )
      );
    }

    return new ObservableQueryCosmosBalancesImpl(
      this.parentMap.get(key)!,
      chainId,
      chainGetter,
      denomHelper
    );
  }
}
