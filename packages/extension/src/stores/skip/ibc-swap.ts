import {
  ChainGetter,
  HasMapStore,
  IChainInfoImpl,
  IChainStore,
} from "@keplr-wallet/stores";
import { AppCurrency, Currency } from "@keplr-wallet/types";
import { ObservableQueryAssets } from "./assets";
import { computed, makeObservable } from "mobx";
import { ObservableQueryChains } from "./chains";
import { CoinPretty } from "@keplr-wallet/unit";
import { ObservableQueryRoute, ObservableQueryRouteInner } from "./route";
import {
  ObservableQueryMsgsDirect,
  ObservableQueryMsgsDirectInner,
} from "./msgs-direct";
import { computedFn } from "mobx-utils";
import { ObservableQueryIbcPfmTransfer } from "./ibc-pfm-transfer";

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
    protected readonly queryIBCPacketForwardingTransfer: ObservableQueryIbcPfmTransfer,
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

  isSwappableCurrency(chainId: string, currency: AppCurrency): boolean {
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
  get swapCurrenciesMap(): Map<string, Map<string, AppCurrency>> {
    const swapChainInfo = this.chainStore.getChain(this.swapVenue.chainId);

    const queryAssets = this.queryAssets.getAssets(swapChainInfo.chainId);
    const assets = queryAssets.assets;

    const res = new Map<string, Map<string, AppCurrency>>();

    const getMap = (chainId: string) => {
      const chainIdentifier = this.chainStore.getChain(chainId).chainIdentifier;
      let innerMap = res.get(chainIdentifier);
      if (!innerMap) {
        innerMap = new Map<string, AppCurrency>();
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
          // 현재 CW20같은 얘들은 처리할 수 없다.
          if (!("type" in currency.originCurrency)) {
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
          }
        } else if (!("paths" in currency)) {
          // 현재 CW20같은 얘들은 처리할 수 없다.
          if (!("type" in currency)) {
            // if currency is not ibc currency
            getMap(chainId).set(currency.coinMinimalDenom, currency);
          }
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
          // 현재 CW20같은 얘들은 처리할 수 없다.
          if (!("type" in currency.originCurrency)) {
            // 일단 현재는 복잡한 케이스는 생각하지 않는다.
            // 오스모시스를 거쳐서 오기 때문에 ibc 모듈만 있다면 자산을 받을 수 있다.
            const originCurrency = currency.originCurrency;
            const inner = getMap(currency.originChainId);
            inner.currencies.push(originCurrency);
          }
        } else if (!("paths" in currency)) {
          // 현재 CW20같은 얘들은 처리할 수 없다.
          if (!("type" in currency)) {
            // if currency is not ibc currency
            const inner = getMap(chainId);
            inner.currencies.push(currency);
          }
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

  isSwapDestinationOrAlternatives = computedFn(
    (chainId: string, currency: AppCurrency): boolean => {
      if (
        this.swapDestinationCurrenciesMap
          .get(this.chainStore.getChain(chainId).chainIdentifier)
          ?.currencies.find(
            (c) => c.coinMinimalDenom === currency.coinMinimalDenom
          )
      ) {
        return true;
      }

      if ("paths" in currency) {
        // IBC currency인데 origin에 대한 정보가 없다면 처리할 수 없다.
        if (!currency.originChainId || !currency.originCurrency) {
          return false;
        }

        const originOutChainId = currency.originChainId;
        const originOutCurrency = currency.originCurrency;

        const channels = this.queryIBCPacketForwardingTransfer.getIBCChannels(
          originOutChainId,
          originOutCurrency.coinMinimalDenom
        );

        // 다른 후보들은 사실 ibc pfm transfer가 가능한 채널 정보와 로직이 유사하다.
        // 차이점은 ibc pfm transfer의 경우는 시작지점이 tx를 보내는 체인이지만
        // ibc swap의 경우는 이렇게 처리할 수 없다. (일단 기본적으로 무조건 osmosis를 거치기 때문에)
        // ibc pfm transfer의 경우 시작 지점을 보내는 체인의 경우 ibc module의 memo만 지원하면
        // 두번째 체인부터 pfm을 지원하면 되기 때문에 보내는 체인의 경우는 이러한 확인을 하지 않는다.
        // 하지만 ibc swap의 경우는 ibc pfm transfer 상의 보내는 체인은 시작 지점이 될 수 없기 때문에 pfm에 대한 확인을 꼭 해야한다.
        if (
          !this.chainStore.getChain(originOutChainId).hasFeature("ibc-go") ||
          !this.queryChains.isSupportsMemo(originOutChainId) ||
          !this.queryChains.isPFMEnabled(originOutChainId) ||
          !this.chainStore.getChain(originOutChainId).hasFeature("ibc-pfm")
        ) {
          // 만약 originOutChainId가 ibc-pfm을 지원하지 않는다면
          // 여기서 더 routing할 방법은 없다.
          // osmosis의 경우는 ibc transfer가 아니라 그대로 osmosis에서 남기 때문에
          // 따로 추가해주고 반환한다.
          const findSwapVenue = channels.find(
            (channel) =>
              channel.channels.length === 1 &&
              this.chainStore.getChain(channel.channels[0].counterpartyChainId)
                .chainIdentifier ===
                this.chainStore.getChain(this.swapVenue.chainId).chainIdentifier
          );
          if (findSwapVenue) {
            return true;
          }
        }

        for (const channel of channels) {
          if (
            channel.destinationChainId ===
              this.chainStore.getChain(chainId).chainId &&
            channel.denom === currency.coinMinimalDenom
          ) {
            return true;
          }
        }
      }

      return false;
    }
  );

  getSwapDestinationCurrencyAlternativeChains = computedFn(
    (
      chainInfo: IChainInfoImpl,
      currency: AppCurrency
    ): { denom: string; chainId: string }[] => {
      if (
        "paths" in currency &&
        (!currency.originChainId || !currency.originCurrency)
      ) {
        // IBC currency인데 origin에 대한 정보가 없다면 처리할 수 없다.
        // 사실상 오류 케이스인데 어케 처리할 지 난해하기 때문에 일단 빈 배열을 반환.
        return [];
      }

      const originOutChainId = (() => {
        if ("originChainId" in currency && currency.originChainId) {
          return currency.originChainId;
        }
        return chainInfo.chainId;
      })();
      const originOutCurrency = (() => {
        if ("originCurrency" in currency && currency.originCurrency) {
          return currency.originCurrency;
        }
        return currency;
      })();

      const res: { denom: string; chainId: string }[] = [
        {
          // 기본적으로 origin에 대한 정보를 넣어준다.
          chainId: originOutChainId,
          denom: originOutCurrency.coinMinimalDenom,
        },
      ];

      const channels = this.queryIBCPacketForwardingTransfer.getIBCChannels(
        originOutChainId,
        originOutCurrency.coinMinimalDenom
      );
      // 다른 후보들은 사실 ibc pfm transfer가 가능한 채널 정보와 로직이 유사하다.
      // 차이점은 ibc pfm transfer의 경우는 시작지점이 tx를 보내는 체인이지만
      // ibc swap의 경우는 이렇게 처리할 수 없다. (일단 기본적으로 무조건 osmosis를 거치기 때문에)
      // ibc pfm transfer의 경우 시작 지점을 보내는 체인의 경우 ibc module의 memo만 지원하면
      // 두번째 체인부터 pfm을 지원하면 되기 때문에 보내는 체인의 경우는 이러한 확인을 하지 않는다.
      // 하지만 ibc swap의 경우는 ibc pfm transfer 상의 보내는 체인은 시작 지점이 될 수 없기 때문에 pfm에 대한 확인을 꼭 해야한다.
      if (
        !this.chainStore.getChain(originOutChainId).hasFeature("ibc-go") ||
        !this.queryChains.isSupportsMemo(originOutChainId) ||
        !this.queryChains.isPFMEnabled(originOutChainId) ||
        !this.chainStore.getChain(originOutChainId).hasFeature("ibc-pfm")
      ) {
        // 만약 originOutChainId가 ibc-pfm을 지원하지 않는다면
        // 여기서 더 routing할 방법은 없다.
        // osmosis의 경우는 ibc transfer가 아니라 그대로 osmosis에서 남기 때문에
        // 따로 추가해주고 반환한다.
        const findSwapVenue = channels.find(
          (channel) =>
            channel.channels.length === 1 &&
            this.chainStore.getChain(channel.channels[0].counterpartyChainId)
              .chainIdentifier ===
              this.chainStore.getChain(this.swapVenue.chainId).chainIdentifier
        );
        if (findSwapVenue) {
          res.push({
            denom: findSwapVenue.denom,
            chainId: findSwapVenue.destinationChainId,
          });
        }
        return res;
      }
      for (const channel of channels) {
        if (channel.channels.length > 0) {
          res.push({
            denom: channel.denom,
            chainId: channel.destinationChainId,
          });
        }
      }

      return res;
    }
  );
}
