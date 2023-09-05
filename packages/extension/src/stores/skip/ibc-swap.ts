import {
  ChainGetter,
  HasMapStore,
  IChainInfoImpl,
  IChainStore,
} from "@keplr-wallet/stores";
import { Currency, IBCCurrency } from "@keplr-wallet/types";
import { ObservableQueryAssets } from "./assets";
import { computed, makeObservable } from "mobx";
import { ObservableQueryChains } from "./chains";
import { CoinPretty } from "@keplr-wallet/unit";
import { ObservableQueryRoute, ObservableQueryRouteInner } from "./route";
import {
  ObservableQueryMsgsDirect,
  ObservableQueryMsgsDirectInner,
} from "./msgs-direct";

export class ObservableQueryIBCSwapInner {
  constructor(
    protected readonly chainGetter: ChainGetter,
    protected readonly queryRoute: ObservableQueryRoute,
    protected readonly queryMsgsDirect: ObservableQueryMsgsDirect,
    public readonly amountInDenom: string,
    public readonly amountInAmount: string,
    public readonly sourceAssetChainId: string,
    public readonly destAssetDenom: string,
    public readonly destAssetChainId: string,
    public readonly affiliateFeeBps: number,
    public readonly swapVenue: {
      readonly name: string;
      readonly chainId: string;
    }
  ) {}

  getQueryMsgsDirect(
    chainIdsToAddresses: Record<string, string>,
    slippageTolerancePercent: number,
    affiliateFeeReceiver: string
  ): ObservableQueryMsgsDirectInner {
    const inAmount = new CoinPretty(
      this.chainGetter
        .getChain(this.sourceAssetChainId)
        .forceFindCurrency(this.amountInDenom),
      this.amountInAmount
    );

    return this.queryMsgsDirect.getRoute(
      inAmount,
      this.sourceAssetChainId,
      this.destAssetDenom,
      this.destAssetChainId,
      chainIdsToAddresses,
      slippageTolerancePercent,
      this.affiliateFeeBps,
      affiliateFeeReceiver,
      this.swapVenue
    );
  }

  getQueryRoute(): ObservableQueryRouteInner {
    const inAmount = new CoinPretty(
      this.chainGetter
        .getChain(this.sourceAssetChainId)
        .forceFindCurrency(this.amountInDenom),
      this.amountInAmount
    );

    return this.queryRoute.getRoute(
      this.sourceAssetChainId,
      inAmount,
      this.destAssetChainId,
      this.destAssetDenom,
      this.affiliateFeeBps,
      this.swapVenue
    );
  }
}

export class ObservableQueryIbcSwap extends HasMapStore<ObservableQueryIBCSwapInner> {
  constructor(
    protected readonly chainStore: IChainStore,
    protected readonly queryAssets: ObservableQueryAssets,
    protected readonly queryChains: ObservableQueryChains,
    protected readonly queryRoute: ObservableQueryRoute,
    protected readonly queryMsgsDirect: ObservableQueryMsgsDirect,
    public readonly swapVenue: {
      readonly name: string;
      readonly chainId: string;
    }
  ) {
    super((str) => {
      const parsed = JSON.parse(str);
      return new ObservableQueryIBCSwapInner(
        this.chainStore,
        this.queryRoute,
        this.queryMsgsDirect,
        parsed.sourceDenom,
        parsed.sourceAmount,
        parsed.sourceChainId,
        parsed.destDenom,
        parsed.destChainId,
        parsed.affiliateFeeBps,
        parsed.swapVenue
      );
    });

    makeObservable(this);
  }

  getIBCSwap(
    sourceChainId: string,
    amount: CoinPretty,
    destChainId: string,
    destDenom: string,
    affiliateFeeBps: number
  ): ObservableQueryIBCSwapInner {
    const str = JSON.stringify({
      sourceChainId,
      sourceAmount: amount.toCoin().amount,
      sourceDenom: amount.currency.coinMinimalDenom,
      destChainId,
      destDenom,
      affiliateFeeBps,
      swapVenue: this.swapVenue,
    });
    return this.get(str);
  }

  isSwappableCurrency(
    chainId: string,
    currency: Currency | IBCCurrency
  ): boolean {
    const chainIdentifier = this.chainStore.getChain(chainId).chainIdentifier;
    return (
      this.swapCurrenciesMap.has(chainIdentifier) &&
      this.swapCurrenciesMap
        .get(chainIdentifier)!
        .has(currency.coinMinimalDenom)
    );
  }

  // Key: chain identifier, inner key: coin minimal denom
  @computed
  get swapCurrenciesMap(): Map<string, Map<string, Currency | IBCCurrency>> {
    const swapChainInfo = this.chainStore.getChain(this.swapVenue.chainId);

    const queryAssets = this.queryAssets.getAssets(swapChainInfo.chainId);
    const assets = queryAssets.assets;

    const res = new Map<string, Map<string, Currency | IBCCurrency>>();

    const getMap = (chainId: string) => {
      const chainIdentifier = this.chainStore.getChain(chainId).chainIdentifier;
      let innerMap = res.get(chainIdentifier);
      if (!innerMap) {
        innerMap = new Map<string, Currency | IBCCurrency>();
        res.set(chainIdentifier, innerMap);
      }

      return innerMap;
    };

    for (const asset of assets) {
      const chainId = asset.chainId;

      const currency = this.chainStore
        .getChain(chainId)
        .findCurrency(asset.denom);

      if (currency) {
        // If ibc currency is well known.
        if (
          "originCurrency" in currency &&
          currency.originCurrency &&
          "originChainId" in currency &&
          currency.originChainId &&
          // XXX: multi-hop ibc currency는 나중에 생각해본다...
          currency.paths.length === 1
        ) {
          const originChainId = currency.originChainId;
          if (this.queryChains.isSupportsMemo(originChainId)) {
            // 기본적으로 해당 체인이 ibc transfer에서 memo를 지원하지 않으면 osmosis에서 pfm을 쓸 수 없기 때문에
            // 해당 체인의 ibc currency를 넣지 않는다.
            const originCurrency = currency.originCurrency;
            getMap(currency.originChainId).set(
              originCurrency.coinMinimalDenom,
              originCurrency
            );
          }

          // osmosis 자체에 있는 ibc currency도 넣어준다.
          getMap(chainId).set(currency.coinMinimalDenom, currency);
        } else if (!("paths" in currency)) {
          // if currency is not ibc currency
          getMap(chainId).set(currency.coinMinimalDenom, currency);
        }
      }
    }

    return res;
  }

  // Key is chain identifier
  @computed
  get swapDestinationCurrenciesMap(): Map<
    string,
    {
      chainInfo: IChainInfoImpl;
      currencies: Currency[];
    }
  > {
    const swapChainInfo = this.chainStore.getChain(this.swapVenue.chainId);

    const queryAssets = this.queryAssets.getAssets(swapChainInfo.chainId);
    const assets = queryAssets.assets;

    // Key is chain identifier
    const res = new Map<
      string,
      {
        chainInfo: IChainInfoImpl;
        currencies: Currency[];
      }
    >();

    const getMap = (chainId: string) => {
      const chainIdentifier = this.chainStore.getChain(chainId).chainIdentifier;
      let inner = res.get(chainIdentifier);
      if (!inner) {
        inner = {
          chainInfo: this.chainStore.getChain(chainId),
          currencies: [],
        };
        res.set(chainIdentifier, inner);
      }

      return inner;
    };

    for (const asset of assets) {
      const chainId = asset.chainId;

      const currency = this.chainStore
        .getChain(chainId)
        .findCurrency(asset.denom);

      if (currency) {
        // If ibc currency is well known.
        if (
          "originCurrency" in currency &&
          currency.originCurrency &&
          "originChainId" in currency &&
          currency.originChainId &&
          // XXX: multi-hop ibc currency는 나중에 생각해본다...
          currency.paths.length === 1
        ) {
          // 일단 현재는 복잡한 케이스는 생각하지 않는다.
          // 오스모시스를 거쳐서 오기 때문에 ibc 모듈만 있다면 자산을 받을 수 있다.
          const originCurrency = currency.originCurrency;
          const inner = getMap(currency.originChainId);
          inner.currencies.push(originCurrency);
        } else if (!("paths" in currency)) {
          // if currency is not ibc currency
          const inner = getMap(chainId);
          inner.currencies.push(currency);
        }
      }
    }

    return res;
  }

  @computed
  get swapDestinationCurrencies(): {
    chainInfo: IChainInfoImpl;
    currencies: Currency[];
  }[] {
    return Array.from(this.swapDestinationCurrenciesMap.values());
  }
}
