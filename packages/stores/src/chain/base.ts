import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import {
  AppCurrency,
  Bech32Config,
  BIP44,
  ChainInfo,
  Currency,
} from "@keplr-wallet/types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { IChainStore, IChainInfoImplSuper } from "./types";
import { AxiosRequestConfig } from "axios";
import { keepAlive } from "mobx-utils";

export interface CurrencyRegistrar {
  observeUnknownDenom(
    coinMinimalDenom: string
  ): AppCurrency | [AppCurrency | undefined, boolean] | undefined;
}

export type CurrencyRegistrarCreator<C extends ChainInfo = ChainInfo> = (
  chainInfo: ChainInfoImpl<C>
) => CurrencyRegistrar;

export class ChainInfoImpl<C extends ChainInfo = ChainInfo>
  implements IChainInfoImplSuper<C> {
  @observable.ref
  protected _chainInfo: C;

  @observable.shallow
  protected _unknownDenoms: string[] = [];

  @observable.shallow
  protected registeredCurrencies: AppCurrency[] = [];

  /**
   * When value has been added to `unknownDenoms`, we run the functions of array in order.
   * If Currency is returned, we assume that registrar has processed the denom and stop iteration.
   * A tuple of [AppCurrency, boolean] could be also returned, and in this case observe until the latter boolean has been true.
   * Could be used in cases when registered currency could be replaced in the future,
   * as in the case of having to return raw currency before query has ended (e.g IBC Tokens)
   */
  @observable
  protected currencyRegistrars: CurrencyRegistrar[] = [];

  constructor(chainInfo: C) {
    this._chainInfo = chainInfo;

    makeObservable(this);

    keepAlive(this, "currencyMap");
  }

  protected getCurrencyFromRegistrars(
    coinMinimalDenom: string
  ): [AppCurrency | undefined, boolean] | undefined {
    for (let i = 0; i < this.currencyRegistrars.length; i++) {
      const registrar = this.currencyRegistrars[i];
      if (registrar.observeUnknownDenom) {
        const currency = registrar.observeUnknownDenom(coinMinimalDenom);
        if (currency) {
          // Case that only currency returned
          if ("coinMinimalDenom" in currency) {
            return [currency, true];
          }
          return currency;
        }
      }
    }
    return undefined;
  }

  get unknownDenoms(): ReadonlyArray<string> {
    return this._unknownDenoms;
  }

  /*
   * When the currency of the corresponding denom is unknown, you can use this method to request registration.
   * Do nothing if already registered or attempting to register.
   * For example, an unknown denom appears in the native balance query, or
   * can be used to request registration of IBC denom.
   */
  @action
  addUnknownDenoms(...coinMinimalDenoms: string[]) {
    for (const coinMinimalDenom of coinMinimalDenoms) {
      if (this._unknownDenoms.find((denom) => denom === coinMinimalDenom)) {
        continue;
      }

      if (this.currencyMap.has(coinMinimalDenom)) {
        continue;
      }

      this._unknownDenoms.push(coinMinimalDenom);

      const disposer = autorun(() => {
        const registered = this.getCurrencyFromRegistrars(coinMinimalDenom);
        if (registered) {
          const [currency, committed] = registered;
          runInAction(() => {
            if (currency) {
              const index = this._unknownDenoms.findIndex(
                (denom) => denom === coinMinimalDenom
              );
              if (index >= 0) {
                this._unknownDenoms.splice(index, 1);
              }

              this.addOrReplaceCurrencies(currency);
            }

            if (committed) {
              disposer();
            }
          });
        } else {
          disposer();
        }
      });
    }
  }

  @action
  registerCurrencyRegistrar(registrar: CurrencyRegistrar): void {
    this.currencyRegistrars.push(registrar);
  }

  @action
  setChainInfo(chainInfo: C) {
    this._chainInfo = chainInfo;
  }

  get embedded(): C {
    return this._chainInfo;
  }

  get chainId(): string {
    return this._chainInfo.chainId;
  }

  @computed
  get knownDenoms(): string[] {
    return this._chainInfo.currencies
      .map((cur) => cur.coinMinimalDenom)
      .concat(this.registeredCurrencies.map((cur) => cur.coinMinimalDenom));
  }

  @computed
  get currencyMap(): Map<string, AppCurrency> {
    const result: Map<string, AppCurrency> = new Map();
    const currencies = this._chainInfo.currencies.concat(
      this.registeredCurrencies
    );
    for (const currency of currencies) {
      result.set(currency.coinMinimalDenom, currency);
    }
    return result;
  }

  @action
  addCurrencies(...currencies: AppCurrency[]) {
    const currencyMap = this.currencyMap;
    for (const currency of currencies) {
      if (!currencyMap.has(currency.coinMinimalDenom)) {
        this.registeredCurrencies.push(currency);
      }
    }
  }

  @action
  removeCurrencies(...coinMinimalDenoms: (string | AppCurrency)[]) {
    const map = new Map<string, boolean>();
    for (let coinMinimalDenom of coinMinimalDenoms) {
      if (typeof coinMinimalDenom !== "string") {
        coinMinimalDenom = coinMinimalDenom.coinMinimalDenom;
      }
      map.set(coinMinimalDenom, true);
    }

    this.registeredCurrencies = this.registeredCurrencies.filter(
      (currency) => !map.get(currency.coinMinimalDenom)
    );
  }

  @action
  addOrReplaceCurrencies(...currencies: AppCurrency[]) {
    for (const currency of currencies) {
      if (this.currencyMap.has(currency.coinMinimalDenom)) {
        const index = this.registeredCurrencies.findIndex(
          (cur) => cur.coinMinimalDenom === currency.coinMinimalDenom
        );
        if (index >= 0) {
          this.registeredCurrencies.splice(index, 1, currency);
        }
      } else {
        this.registeredCurrencies.push(currency);
      }
    }
  }

  /**
   * Return currency if exists
   * If not, add that denom to unknown denoms.
   * Alternatively, able to iterate all known denoms by passing finding function.
   * @param coinMinimalDenom
   */
  findCurrency(
    coinMinimalDenom:
      | string
      | ((coinMinimalDenom: string) => boolean | null | undefined)
  ): AppCurrency | undefined {
    let currencies: AppCurrency[];

    if (typeof coinMinimalDenom === "string") {
      currencies = this.findCurrencies(coinMinimalDenom);
    } else {
      currencies = this.findCurrencies(coinMinimalDenom);
    }

    if (currencies.length === 1) {
      return currencies[0];
    }
  }

  /**
   * Similar to findCurrency, but returns raw currency if the corresponding currency does not exist.
   * @param coinMinimalDenom
   */
  forceFindCurrency(coinMinimalDenom: string): AppCurrency {
    const currency = this.findCurrency(coinMinimalDenom);
    if (!currency) {
      return {
        coinMinimalDenom,
        coinDenom: coinMinimalDenom,
        coinDecimals: 0,
      };
    }
    return currency;
  }

  findCurrencies(...coinMinimalDenoms: string[]): AppCurrency[];
  findCurrencies(
    findingFunction: (coinMinimalDenom: string) => boolean | null | undefined
  ): AppCurrency[];
  findCurrencies(
    ...coinMinimalDenoms: (
      | string
      | ((coinMinimalDenom: string) => boolean | null | undefined)
    )[]
  ): AppCurrency[] {
    const result: AppCurrency[] = [];

    for (const coinMinimalDenom of coinMinimalDenoms) {
      if (typeof coinMinimalDenom === "string") {
        let cur = this.currencyMap.get(coinMinimalDenom);
        if (cur) {
          result.push(cur);
        } else {
          this.addUnknownDenoms(coinMinimalDenom);
          // Unknown denom can be registered synchronously in some cases.
          // For this case, re-try to get currency.
          cur = this.currencyMap.get(coinMinimalDenom);
          if (cur) {
            result.push(cur);
          }
        }
      } else {
        for (const [denom, currency] of this.currencyMap.entries()) {
          if (coinMinimalDenom(denom)) {
            result.push(currency);
          }
        }
      }
    }

    return result;
  }

  forceFindCurrencies(...coinMinimalDenoms: string[]): AppCurrency[] {
    const currencies = this.findCurrencies(...coinMinimalDenoms);

    const currencyMap = new Map<string, AppCurrency>();
    for (const currency of currencies) {
      currencyMap.set(currency.coinMinimalDenom, currency);
    }

    return coinMinimalDenoms.map((coinMinimalDenom) => {
      const currency = currencyMap.get(coinMinimalDenom);
      if (currency) {
        return currency;
      } else {
        return {
          coinMinimalDenom,
          coinDenom: coinMinimalDenom,
          coinDecimals: 0,
        };
      }
    });
  }

  get stakeCurrency(): Currency {
    return this._chainInfo.stakeCurrency;
  }

  get alternativeBIP44s(): BIP44[] | undefined {
    return this._chainInfo.alternativeBIP44s;
  }

  get bech32Config(): Bech32Config {
    return this._chainInfo.bech32Config;
  }
  get beta(): boolean | undefined {
    return this._chainInfo.beta;
  }

  get bip44(): BIP44 {
    return this._chainInfo.bip44;
  }

  get chainName(): string {
    return this._chainInfo.chainName;
  }

  get coinType(): number | undefined {
    return this._chainInfo.coinType;
  }

  get features(): string[] | undefined {
    return this._chainInfo.features;
  }

  get feeCurrencies(): Currency[] {
    return this._chainInfo.feeCurrencies;
  }

  get gasPriceStep():
    | { low: number; average: number; high: number }
    | undefined {
    return this._chainInfo.gasPriceStep;
  }

  get rest(): string {
    return this._chainInfo.rest;
  }

  get restConfig(): AxiosRequestConfig | undefined {
    return this._chainInfo.restConfig;
  }

  get rpc(): string {
    return this._chainInfo.rpc;
  }

  get rpcConfig(): AxiosRequestConfig | undefined {
    return this._chainInfo.rpcConfig;
  }

  get walletUrl(): string | undefined {
    return this._chainInfo.walletUrl;
  }

  get walletUrlForStaking(): string | undefined {
    return this._chainInfo.walletUrlForStaking;
  }
}

export class ChainStore<C extends ChainInfo = ChainInfo>
  implements IChainStore<C> {
  @observable.ref
  protected _chainInfos!: ChainInfoImpl<C>[];

  protected currencyRegistrarCreators: CurrencyRegistrarCreator<
    ChainInfo | C
  >[] = [];

  protected _cachedChainInfosMap: Map<string, ChainInfoImpl<C>> = new Map();

  constructor(embedChainInfos: C[]) {
    this.setChainInfos(embedChainInfos);

    makeObservable(this);
  }

  get chainInfos(): ChainInfoImpl<C>[] {
    return this._chainInfos;
  }

  getChain(chainId: string): ChainInfoImpl<C> {
    const chainIdentifier = ChainIdHelper.parse(chainId);

    const find = this.chainInfos.find((info) => {
      return (
        ChainIdHelper.parse(info.chainId).identifier ===
        chainIdentifier.identifier
      );
    });

    if (!find) {
      throw new Error(`Unknown chain info: ${chainId}`);
    }

    return find;
  }

  hasChain(chainId: string): boolean {
    const chainIdentifier = ChainIdHelper.parse(chainId);

    const find = this.chainInfos.find((info) => {
      return (
        ChainIdHelper.parse(info.chainId).identifier ===
        chainIdentifier.identifier
      );
    });

    return find != null;
  }

  addCurrencyRegistrarCreator(
    creator: CurrencyRegistrarCreator<ChainInfo | C>
  ) {
    this.currencyRegistrarCreators.push(creator);

    for (const chainInfo of this.chainInfos) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const cached = this._cachedChainInfosMap.get(chainInfo.chainId)!;
      const currencyRegistrar = creator(cached);
      cached.registerCurrencyRegistrar(currencyRegistrar);
    }
  }

  @action
  protected setChainInfos(chainInfos: C[]) {
    const chainInfoImpls: ChainInfoImpl<C>[] = [];

    for (const chainInfo of chainInfos) {
      if (this._cachedChainInfosMap.has(chainInfo.chainId)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const cached = this._cachedChainInfosMap.get(chainInfo.chainId)!;
        cached.setChainInfo(chainInfo);
        chainInfoImpls.push(cached);
      } else {
        const chainInfoImpl = new ChainInfoImpl(chainInfo);
        this._cachedChainInfosMap.set(chainInfo.chainId, chainInfoImpl);
        chainInfoImpls.push(chainInfoImpl);

        for (const creator of this.currencyRegistrarCreators) {
          const currencyRegistrar = creator(chainInfoImpl);
          chainInfoImpl.registerCurrencyRegistrar(currencyRegistrar);
        }
      }
    }

    this._chainInfos = chainInfoImpls;
  }
}
