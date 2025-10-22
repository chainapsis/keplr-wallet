import {
  action,
  autorun,
  computed,
  IReactionDisposer,
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
  ERC20Currency,
  FeeCurrency,
  ModularChainInfo,
  ChainInfoModule,
} from "@keplr-wallet/types";
import {
  IChainInfoImpl,
  IChainStore,
  CurrencyRegistrar,
  IModularChainInfoImpl,
} from "./types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { keepAlive } from "mobx-utils";
import { DenomHelper, sortedJsonByKeyStringify } from "@keplr-wallet/common";

const forceFindCurrencyCache: Map<string, AppCurrency> = new Map();

export class ChainInfoImpl<C extends ChainInfo = ChainInfo>
  implements IChainInfoImpl<C>
{
  @observable.ref
  protected _embedded: C;

  @observable.shallow
  protected unknownDenoms: {
    denom: string;
    reaction: boolean;
  }[] = [];

  @observable.shallow
  protected registeredCurrencies: AppCurrency[] = [];
  @observable.shallow
  protected registeredCurrenciesNoReaction: AppCurrency[] = [];

  @observable.shallow
  protected registrationInProgressCurrencyMap: Map<string, boolean> = new Map();

  constructor(
    embedded: C,
    protected readonly currencyRegistry: {
      getCurrencyRegistrar: CurrencyRegistrar;
    }
  ) {
    this._embedded = embedded;

    makeObservable(this);

    keepAlive(this, "currencyMap");
    keepAlive(this, "unknownDenomMap");
  }

  /*
   * 해당되는 denom의 currency를 모를 때 이 메소드를 사용해서 등록을 요청할 수 있다.
   * 이미 등록되어 있거나 등록을 시도 중이면 아무 행동도 하지 않는.
   * 예를들어 네이티브 balance 쿼리에서 모르는 denom이 나오거나
   * IBC denom의 등록을 요청할 때 쓸 수 있다.
   * action 안에서는 autorun이 immediate로 실행되지 않으므로, 일단 @action 데코레이터는 사용하지 않는다.
   * 하지만 이 메소드를 action 안에서 호출하면 여전히 immediate로 실행되지 않으므로, 이 경우도 고려해야한다.
   */
  addUnknownDenoms(...coinMinimalDenoms: string[]) {
    this.addUnknownDenomsImpl(coinMinimalDenoms, true);
  }

  addUnknownDenomsWithoutReaction(...coinMinimalDenoms: string[]) {
    this.addUnknownDenomsImpl(coinMinimalDenoms, false);
  }

  protected addUnknownDenomsImpl(
    coinMinimalDenoms: string[],
    reaction: boolean
  ) {
    for (const coinMinimalDenom of coinMinimalDenoms) {
      const normalizedCoinMinimalDenom =
        DenomHelper.normalizeDenom(coinMinimalDenom);
      let found = false;
      const prior = this.unknownDenomMap.get(normalizedCoinMinimalDenom);
      if (prior) {
        if (prior.reaction === reaction) {
          continue;
        } else if (reaction) {
          found = true;
          // 로직상 reaction은 reactive할 필요가 없기 때문에
          // 그냥 여기서 바꾼다.
          prior.reaction = reaction;
        }
      }

      if (this.currencyMap.has(normalizedCoinMinimalDenom)) {
        continue;
      }

      if (this.currencyNoReactionMap.has(normalizedCoinMinimalDenom)) {
        continue;
      }

      if (!found) {
        runInAction(() => {
          this.unknownDenoms.push({
            denom: normalizedCoinMinimalDenom,
            reaction,
          });
          this.unknownDenoms = this.unknownDenoms.slice();
          this.registrationInProgressCurrencyMap.set(
            normalizedCoinMinimalDenom,
            true
          );
        });
      }

      let i = 0;
      let disposed = false;
      const disposer = autorun(() => {
        i++;
        const dispose = () => {
          disposed = true;

          if (i === 1) {
            setTimeout(() => {
              if (disposer) {
                disposer();
              }
            }, 1);
          } else {
            if (disposer) {
              disposer();
            }
          }
        };

        if (disposed) {
          return;
        }

        const generator = this.currencyRegistry.getCurrencyRegistrar(
          this.chainId,
          normalizedCoinMinimalDenom
        );
        if (generator) {
          const currency = generator.value;
          runInAction(() => {
            if (!generator.done) {
              this.registrationInProgressCurrencyMap.set(
                normalizedCoinMinimalDenom,
                true
              );
            }

            if (currency) {
              const index = this.unknownDenoms.findIndex(
                (denom) => denom.denom === normalizedCoinMinimalDenom
              );
              let prev:
                | {
                    denom: string;
                    reaction: boolean;
                  }
                | undefined;
              if (index >= 0) {
                prev = this.unknownDenoms[index];
                if (generator.done) {
                  this.unknownDenoms.splice(index, 1);
                  this.unknownDenoms = this.unknownDenoms.slice();
                }
              }

              if (!prev || prev.reaction) {
                this.addOrReplaceCurrency(currency);
              } else {
                this.addOrReplaceCurrencyNoReaction(currency);
              }
            }

            if (generator.done) {
              this.registrationInProgressCurrencyMap.delete(
                normalizedCoinMinimalDenom
              );
            }
          });

          if (generator.done) {
            dispose();
          }
        } else {
          if (
            this.registrationInProgressCurrencyMap.get(
              normalizedCoinMinimalDenom
            )
          ) {
            runInAction(() => {
              this.registrationInProgressCurrencyMap.delete(
                normalizedCoinMinimalDenom
              );
            });
          }

          dispose();
        }
      });
    }
  }

  get embedded(): C {
    return this._embedded;
  }

  get chainId(): string {
    return this._embedded.chainId;
  }

  @computed
  get chainIdentifier(): string {
    return ChainIdHelper.parse(this.chainId).identifier;
  }

  @computed
  get currencies(): AppCurrency[] {
    return this._embedded.currencies.concat(this.registeredCurrencies);
  }

  @computed
  protected get currencyMap(): Map<string, AppCurrency> {
    const result: Map<string, AppCurrency> = new Map();
    for (const currency of this.currencies) {
      result.set(currency.coinMinimalDenom, currency);
    }
    return result;
  }

  @computed
  protected get currencyNoReactionMap(): Map<string, AppCurrency> {
    const result: Map<string, AppCurrency> = new Map();
    for (const currency of this.registeredCurrenciesNoReaction) {
      result.set(currency.coinMinimalDenom, currency);
    }
    return result;
  }

  @action
  protected moveNoReactionCurrencyToReaction(coinMinimalDenom: string) {
    const index = this.registeredCurrenciesNoReaction.findIndex(
      (cur) => cur.coinMinimalDenom === coinMinimalDenom
    );
    if (index >= 0) {
      const currency = this.registeredCurrenciesNoReaction[index];
      this.registeredCurrenciesNoReaction.splice(index, 1);
      this.registeredCurrenciesNoReaction =
        this.registeredCurrenciesNoReaction.slice();
      this.registeredCurrencies.push(currency);
      this.registeredCurrencies = this.registeredCurrencies.slice();
    }
  }

  @computed
  protected get unknownDenomMap(): Map<
    string,
    { denom: string; reaction: boolean }
  > {
    const result: Map<
      string,
      {
        denom: string;
        reaction: boolean;
      }
    > = new Map();
    for (const denom of this.unknownDenoms) {
      result.set(denom.denom, denom);
    }
    return result;
  }

  @action
  addCurrencies(...currencies: AppCurrency[]) {
    if (currencies.length === 0) {
      return;
    }

    const currencyMap = this.currencyMap;
    for (const currency of currencies) {
      const normalizedCoinMinimalDenom = DenomHelper.normalizeDenom(
        currency.coinMinimalDenom
      );
      if (!currencyMap.has(normalizedCoinMinimalDenom)) {
        this.registeredCurrencies.push({
          ...currency,
          coinMinimalDenom: normalizedCoinMinimalDenom,
        });
        this.registeredCurrencies = this.registeredCurrencies.slice();
      }
    }
  }

  @action
  removeCurrencies(...coinMinimalDenoms: string[]) {
    if (coinMinimalDenoms.length === 0) {
      return;
    }

    const map = new Map<string, boolean>();
    for (const coinMinimalDenom of coinMinimalDenoms) {
      const normalizedCoinMinimalDenom =
        DenomHelper.normalizeDenom(coinMinimalDenom);
      map.set(normalizedCoinMinimalDenom, true);
    }

    this.registeredCurrencies = this.registeredCurrencies.filter(
      (currency) =>
        !map.get(DenomHelper.normalizeDenom(currency.coinMinimalDenom))
    );
  }

  /**
   * Currency를 반환한다.
   * 만약 해당 Currency가 없다면 unknown currency에 추가한다.
   * @param coinMinimalDenom
   */
  findCurrency(coinMinimalDenom: string): AppCurrency | undefined {
    const normalizedCoinMinimalDenom =
      DenomHelper.normalizeDenom(coinMinimalDenom);
    if (this.currencyMap.has(normalizedCoinMinimalDenom)) {
      return this.currencyMap.get(normalizedCoinMinimalDenom);
    }
    if (this.currencyNoReactionMap.has(normalizedCoinMinimalDenom)) {
      this.moveNoReactionCurrencyToReaction(normalizedCoinMinimalDenom);
      return this.currencyNoReactionMap.get(normalizedCoinMinimalDenom);
    }
    this.addUnknownDenoms(normalizedCoinMinimalDenom);

    // Unknown denom can be registered synchronously in some cases.
    // For this case, re-try to get currency.
    if (this.currencyMap.has(normalizedCoinMinimalDenom)) {
      return this.currencyMap.get(normalizedCoinMinimalDenom);
    }
    if (this.currencyNoReactionMap.has(normalizedCoinMinimalDenom)) {
      this.moveNoReactionCurrencyToReaction(normalizedCoinMinimalDenom);
      return this.currencyNoReactionMap.get(normalizedCoinMinimalDenom);
    }
  }

  findCurrencyWithoutReaction(
    coinMinimalDenom: string
  ): AppCurrency | undefined {
    const normalizedCoinMinimalDenom =
      DenomHelper.normalizeDenom(coinMinimalDenom);
    if (this.currencyMap.has(normalizedCoinMinimalDenom)) {
      return this.currencyMap.get(normalizedCoinMinimalDenom);
    }
    if (this.currencyNoReactionMap.has(normalizedCoinMinimalDenom)) {
      return this.currencyNoReactionMap.get(normalizedCoinMinimalDenom);
    }
    this.addUnknownDenomsWithoutReaction(normalizedCoinMinimalDenom);

    // Unknown denom can be registered synchronously in some cases.
    // For this case, re-try to get currency.
    if (this.currencyMap.has(normalizedCoinMinimalDenom)) {
      return this.currencyMap.get(normalizedCoinMinimalDenom);
    }
    if (this.currencyNoReactionMap.has(normalizedCoinMinimalDenom)) {
      return this.currencyNoReactionMap.get(normalizedCoinMinimalDenom);
    }
  }

  findCurrencyAsync(
    coinMinimalDenom: string
  ): Promise<AppCurrency | undefined> {
    const normalizedCoinMinimalDenom =
      DenomHelper.normalizeDenom(coinMinimalDenom);
    if (this.currencyMap.has(normalizedCoinMinimalDenom)) {
      return Promise.resolve(this.currencyMap.get(normalizedCoinMinimalDenom));
    }
    this.addUnknownDenoms(normalizedCoinMinimalDenom);

    let disposal: IReactionDisposer | undefined;

    return new Promise<AppCurrency | undefined>((resolve) => {
      disposal = autorun(() => {
        const registration = this.registrationInProgressCurrencyMap.get(
          normalizedCoinMinimalDenom
        );
        if (!registration) {
          resolve(this.currencyMap.get(normalizedCoinMinimalDenom));
        }
      });
    }).finally(() => {
      if (disposal) {
        disposal();
      }
    });
  }

  /**
   * findCurrency와 비슷하지만 해당하는 currency가 존재하지 않을 경우 raw currency를 반환한다.
   * @param coinMinimalDenom
   */
  forceFindCurrency(coinMinimalDenom: string): AppCurrency {
    const normalizedCoinMinimalDenom =
      DenomHelper.normalizeDenom(coinMinimalDenom);
    const currency = this.findCurrency(normalizedCoinMinimalDenom);
    if (!currency) {
      // ref을 유지하기 위해서 cache를 사용한다.
      if (forceFindCurrencyCache.has(normalizedCoinMinimalDenom)) {
        return forceFindCurrencyCache.get(normalizedCoinMinimalDenom)!;
      }
      const cur = {
        coinMinimalDenom: normalizedCoinMinimalDenom,
        coinDenom: normalizedCoinMinimalDenom,
        coinDecimals: 0,
      };
      forceFindCurrencyCache.set(normalizedCoinMinimalDenom, cur);
      return cur;
    }
    return currency;
  }

  forceFindCurrencyWithoutReaction(coinMinimalDenom: string): AppCurrency {
    const normalizedCoinMinimalDenom =
      DenomHelper.normalizeDenom(coinMinimalDenom);
    const currency = this.findCurrencyWithoutReaction(
      normalizedCoinMinimalDenom
    );
    if (!currency) {
      // ref을 유지하기 위해서 cache를 사용한다.
      if (forceFindCurrencyCache.has(normalizedCoinMinimalDenom)) {
        return forceFindCurrencyCache.get(normalizedCoinMinimalDenom)!;
      }
      const cur = {
        coinMinimalDenom: normalizedCoinMinimalDenom,
        coinDenom: normalizedCoinMinimalDenom,
        coinDecimals: 0,
      };
      forceFindCurrencyCache.set(normalizedCoinMinimalDenom, cur);
      return cur;
    }
    return currency;
  }

  @action
  protected addOrReplaceCurrency(currency: AppCurrency) {
    const normalizedCoinMinimalDenom = DenomHelper.normalizeDenom(
      currency.coinMinimalDenom
    );
    if (this.currencyMap.has(normalizedCoinMinimalDenom)) {
      const index = this.registeredCurrencies.findIndex(
        (cur) => cur.coinMinimalDenom === normalizedCoinMinimalDenom
      );
      if (index >= 0) {
        const prev = this.registeredCurrencies[index];
        if (
          // If same, do nothing
          sortedJsonByKeyStringify(prev) !== sortedJsonByKeyStringify(currency)
        ) {
          this.registeredCurrencies.splice(index, 1, currency);
          this.registeredCurrencies = this.registeredCurrencies.slice();
        }
      }
    } else {
      this.registeredCurrencies.push(currency);
      this.registeredCurrencies = this.registeredCurrencies.slice();
    }
  }

  @action
  protected addOrReplaceCurrencyNoReaction(currency: AppCurrency) {
    const normalizedCoinMinimalDenom = DenomHelper.normalizeDenom(
      currency.coinMinimalDenom
    );
    if (this.currencyNoReactionMap.has(normalizedCoinMinimalDenom)) {
      const index = this.registeredCurrenciesNoReaction.findIndex(
        (cur) => cur.coinMinimalDenom === normalizedCoinMinimalDenom
      );
      if (index >= 0) {
        const prev = this.registeredCurrenciesNoReaction[index];
        if (
          // If same, do nothing
          sortedJsonByKeyStringify(prev) !== sortedJsonByKeyStringify(currency)
        ) {
          this.registeredCurrenciesNoReaction.splice(index, 1, currency);
          this.registeredCurrenciesNoReaction =
            this.registeredCurrenciesNoReaction.slice();
        }
      }
    } else {
      this.registeredCurrenciesNoReaction.push(currency);
      this.registeredCurrenciesNoReaction =
        this.registeredCurrenciesNoReaction.slice();
    }
  }

  get stakeCurrency(): Currency | undefined {
    return this._embedded.stakeCurrency;
  }

  get alternativeBIP44s(): BIP44[] | undefined {
    return this._embedded.alternativeBIP44s;
  }

  get bech32Config(): Bech32Config | undefined {
    return this._embedded.bech32Config;
  }

  get beta(): boolean | undefined {
    return this._embedded.beta;
  }

  get bip44(): BIP44 {
    return this._embedded.bip44;
  }

  get chainName(): string {
    return this._embedded.chainName;
  }

  get features(): string[] {
    return this._embedded.features ?? [];
  }

  get feeCurrencies(): FeeCurrency[] {
    return this._embedded.feeCurrencies;
  }

  get rest(): string {
    return this._embedded.rest;
  }

  get rpc(): string {
    return this._embedded.rpc;
  }

  get walletUrl(): string | undefined {
    return this._embedded.walletUrl;
  }

  get walletUrlForStaking(): string | undefined {
    return this._embedded.walletUrlForStaking;
  }

  get chainSymbolImageUrl(): string | undefined {
    return this._embedded.chainSymbolImageUrl;
  }

  get evm(): { chainId: number; rpc: string } | undefined {
    return this._embedded.evm;
  }

  get hideInUI(): boolean | undefined {
    return this._embedded.hideInUI;
  }

  get isTestnet(): boolean | undefined {
    return this._embedded.isTestnet;
  }

  hasFeature(feature: string): boolean {
    return !!(
      this._embedded.features && this._embedded.features.includes(feature)
    );
  }

  @action
  setEmbeddedChainInfo(embedded: C) {
    this._embedded = embedded;
  }

  isCurrencyRegistrationInProgress(coinMinimalDenom: string): boolean {
    return (
      this.registrationInProgressCurrencyMap.get(coinMinimalDenom) || false
    );
  }
}

export class ModularChainInfoImpl<M extends ModularChainInfo = ModularChainInfo>
  implements IModularChainInfoImpl<M>
{
  @observable.ref
  protected _embedded: M;

  @observable.shallow
  protected registeredCosmosCurrencies: AppCurrency[] = [];
  @observable.shallow
  protected registeredStarkentCurrencies: ERC20Currency[] = [];
  @observable.shallow
  protected registeredBitcoinCurrencies: AppCurrency[] = [];
  @observable.shallow
  protected registeredEvmCurrencies: AppCurrency[] = [];

  // Refactor Note: 일단 IBC asset 에서만 사용되는 것 같아서 Cosmos만 추가
  @observable.shallow
  protected registeredCosmosCurrenciesNoReaction: AppCurrency[] = [];

  // Refactor Note: 기존 방식은 배열 + Map 이중 관리 -> 하나의 Map으로 관리
  @computed
  protected get unknownDenomMap(): Map<
    string,
    { denom: string; reaction: boolean }
  > {
    return new Map();
  }

  @observable.shallow
  protected registrationInProgressCurrencyMap: Map<string, boolean> = new Map();

  // Refactor Note: constructor에서 한 번만 파악하여 들고 있는 available modules 추가
  protected availableModules: ChainInfoModule[];

  constructor(
    embedded: M,
    protected readonly currencyRegistry: {
      getCurrencyRegistrar: CurrencyRegistrar;
    }
  ) {
    this._embedded = embedded;
    this.availableModules = this.detectAvailableModules();

    makeObservable(this);

    keepAlive(this, "cosmosCurrencyMap");
    keepAlive(this, "starknetCurrencyMap");
    keepAlive(this, "bitcoinCurrencyMap");
    keepAlive(this, "evmCurrencyMap");
  }

  protected detectAvailableModules(): ChainInfoModule[] {
    const modules: ChainInfoModule[] = [];
    if ("bitcoin" in this._embedded) modules.push("bitcoin");
    if ("starknet" in this._embedded) modules.push("starknet");
    if ("evm" in this._embedded) modules.push("evm");
    if ("cosmos" in this._embedded) modules.push("cosmos");
    return modules;
  }

  get embedded(): M {
    return this._embedded;
  }

  @action
  setEmbeddedModularChainInfo(embedded: M) {
    this._embedded = embedded;
    this.availableModules = this.detectAvailableModules();
  }

  get chainId(): string {
    return this._embedded.chainId;
  }

  getCurrencies(module: ChainInfoModule): AppCurrency[] {
    switch (module) {
      case "cosmos":
        if (!("cosmos" in this._embedded)) {
          throw new Error(`No cosmos module for this chain: ${this.chainId}`);
        }

        return this._embedded.cosmos.currencies.concat(
          this.registeredCosmosCurrencies
        );
      case "starknet":
        if (!("starknet" in this._embedded)) {
          throw new Error(`No starknet module for this chain: ${this.chainId}`);
        }

        return this._embedded.starknet.currencies.concat(
          this.registeredStarkentCurrencies
        );
      case "bitcoin":
        if (!("bitcoin" in this._embedded)) {
          throw new Error(`No bitcoin module for this chain: ${this.chainId}`);
        }

        return this._embedded.bitcoin.currencies.concat(
          this.registeredBitcoinCurrencies
        );
      case "evm":
        if (!("evm" in this._embedded)) {
          throw new Error(
            `No evm native module for this chain: ${this.chainId}`
          );
        }

        return this._embedded.evm.currencies.concat(
          this.registeredEvmCurrencies
        );

      default:
        throw new Error(`Unknown module: ${module}`);
    }
  }

  /**
   * Currency를 반환한다.
   * 만약 해당 Currency가 없다면 unknownDenomMap에 추가한다.
   * @param coinMinimalDenom
   */
  findCurrency(coinMinimalDenom: string): AppCurrency | undefined {
    const normalizedDenom = DenomHelper.normalizeDenom(coinMinimalDenom);

    const currency = this.findCurrencyByModule(normalizedDenom);
    if (currency) {
      return currency;
    }

    this.availableModules.forEach((module) => {
      // 동적으로 토큰을 발견하고 등록하는 절차는 cosmos, evm 모듈에서만 지원
      if (module === "cosmos" || module === "evm") {
        this.addUnknownDenomsImpl({
          module,
          coinMinimalDenoms: [normalizedDenom],
          reaction: true,
        });
      }
    });

    // Unknown denom can be registered synchronously in some cases.
    // For this case, re-try to get currency.
    return this.findCurrencyByModule(normalizedDenom);
  }

  findCurrencyByModule(denom: string) {
    for (const module of this.availableModules) {
      const currency = this.getCurrencyMapByModule(module).get(denom);

      if (currency) {
        return currency;
      }

      if (module === "cosmos") {
        const noReactionCurrency = this.cosmosCurrencyMapNoReaction.get(denom);
        if (noReactionCurrency) {
          return noReactionCurrency;
        }
      }
    }

    return undefined;
  }

  /**
   * findCurrency와 비슷하지만 해당하는 currency가 존재하지 않을 경우 raw currency를 반환한다.
   * @param coinMinimalDenom
   */
  forceFindCurrency(coinMinimalDenom: string): AppCurrency {
    const normalizedCoinMinimalDenom =
      DenomHelper.normalizeDenom(coinMinimalDenom);

    const currency = this.findCurrency(coinMinimalDenom);

    if (currency) {
      return currency;
    }

    return this.getRawCurrency(normalizedCoinMinimalDenom);
  }

  /**
   * 최적화를 위해 reaction 없이 currency를 조회한다.
   * 현재는 IBC asset에서만 사용되고 있어 Cosmos 모듈만 지원한다.
   * @param coinMinimalDenom
   */
  findCurrencyWithoutReaction(
    coinMinimalDenom: string
  ): AppCurrency | undefined {
    const normalizedCoinMinimalDenom =
      DenomHelper.normalizeDenom(coinMinimalDenom);

    const currency = this.cosmosCurrencyMapNoReaction.get(
      normalizedCoinMinimalDenom
    );

    if (currency) {
      return currency;
    }

    this.addUnknownDenomsImpl({
      module: "cosmos",
      coinMinimalDenoms: [normalizedCoinMinimalDenom],
      reaction: false,
    });
  }

  forceFindCurrencyWithoutReaction(coinMinimalDenom: string): AppCurrency {
    const normalizedCoinMinimalDenom =
      DenomHelper.normalizeDenom(coinMinimalDenom);

    const currency = this.findCurrencyWithoutReaction(
      normalizedCoinMinimalDenom
    );
    if (currency) {
      return currency;
    }

    return this.getRawCurrency(normalizedCoinMinimalDenom);
  }

  /**
   * raw currency를 반환한다. ref을 유지하기 위해서 cache를 사용한다.
   */
  protected getRawCurrency(denom: string): AppCurrency {
    if (forceFindCurrencyCache.has(denom)) {
      return forceFindCurrencyCache.get(denom)!;
    }

    const currency = {
      coinMinimalDenom: denom,
      coinDenom: denom,
      coinDecimals: 0,
    };

    forceFindCurrencyCache.set(denom, currency);

    return currency;
  }

  addUnknownDenoms({
    module,
    coinMinimalDenoms,
  }: {
    module: ChainInfoModule;
    coinMinimalDenoms: string[];
  }) {
    this.addUnknownDenomsImpl({
      module,
      coinMinimalDenoms,
      reaction: true,
    });
  }

  addUnknownDenomsWithoutReaction({
    module,
    coinMinimalDenoms,
  }: {
    module: ChainInfoModule;
    coinMinimalDenoms: string[];
  }) {
    this.addUnknownDenomsImpl({
      module,
      coinMinimalDenoms,
      reaction: false,
    });
  }

  // Refactor Note: 역할이 많아서 함수 분리 + description 디테일 보강

  /**
   * 해당되는 denom의 currency를 모를 때 이 메소드를 사용해서 등록을 요청할 수 있다.
   *
   * - balance 쿼리 결과 등에서 모르는 denom이 나타날 때
   * - IBC denom을 동적으로 등록해야 할 때
   * ---
   * - action 데코레이터가 사용되지 않은 이유: action 내부에서 autorun을 생성하면, autorun의 첫 실행이 action이 끝날 때까지 지연된다.
   *   autorun을 사용하는 startCurrencyRegistration 내부에서 불필요한 지연이 발생할 수 있어 action 없이 구현하여 autorun을 즉시 실행한다.
   *   하지만 이 메소드를 action 안에서 호출하게 되는 경우가 있다면 여전히 즉시 실행되지 않으므로 고려가 필요하다.
   */
  protected addUnknownDenomsImpl({
    module,
    coinMinimalDenoms,
    reaction,
  }: {
    module: ChainInfoModule;
    coinMinimalDenoms: string[];
    reaction: boolean;
  }) {
    for (const coinMinimalDenom of coinMinimalDenoms) {
      const normalizedDenom = DenomHelper.normalizeDenom(coinMinimalDenom);

      // 이미 등록 중인 경우 reaction 모드만 업데이트하고 스킵
      if (this.shouldSkipUnknownDenom(normalizedDenom, reaction)) {
        continue;
      }

      // 이미 currency가 존재하면 스킵
      if (
        reaction &&
        this.getCurrencyMapByModule(module).has(normalizedDenom)
      ) {
        continue;
      }

      // noreaction 맵 확인
      if (!reaction && this.cosmosCurrencyMapNoReaction.has(normalizedDenom)) {
        continue;
      }

      // unknownDenomMap에 등록 및 등록진행중 상태로 변경
      const isNewUnknownDenom = this.addToUnknownDenomMapAndReturnIsNew(
        normalizedDenom,
        reaction
      );

      // 새로운 unknown denom인 경우에만 autorun 시작
      if (isNewUnknownDenom) {
        this.startCurrencyRegistration(module, normalizedDenom);
      }
    }
  }

  // module별 currency map 제공
  protected getCurrencyMapByModule(
    module: ChainInfoModule
  ): Map<string, AppCurrency> {
    switch (module) {
      case "cosmos":
        return this.cosmosCurrencyMap;
      case "starknet":
        return this.starknetCurrencyMap;
      case "bitcoin":
        return this.bitcoinCurrencyMap;
      case "evm":
        return this.evmCurrencyMap;
      default:
        throw new Error(`Unknown module: ${module}`);
    }
  }

  /**
   * 이미 등록 중인 unknown denom인지 체크하고, reaction 업데이트
   */
  protected shouldSkipUnknownDenom(
    normalizedDenom: string,
    reaction: boolean
  ): boolean {
    const prior = this.unknownDenomMap.get(normalizedDenom);
    if (!prior) {
      return false;
    }

    // 같은 reaction 모드면 스킵
    if (prior.reaction === reaction) {
      return true;
    }

    // noReaction을 reaction으로 변경하는 경우
    if (reaction) {
      // 로직상 reaction은 reactive할 필요가 없기 때문에 직접 변경
      prior.reaction = reaction;
    }

    return true;
  }

  /**
   * unknownDenomMap에 등록 및 등록진행중 상태로 변경
   * @returns 새로 추가된 경우 true, 이미 있던 경우 false
   */
  protected addToUnknownDenomMapAndReturnIsNew(
    denom: string,
    reaction: boolean
  ): boolean {
    const prior = this.unknownDenomMap.get(denom);
    if (prior) {
      return false; // 이미 존재하면 새로 추가하지 않음
    }

    runInAction(() => {
      this.unknownDenomMap.set(denom, {
        denom: denom,
        reaction,
      });
      this.registrationInProgressCurrencyMap.set(denom, true);
    });

    return true;
  }

  protected startCurrencyRegistration(
    module: ChainInfoModule,
    denom: string
  ): void {
    let i = 0;
    let disposed = false;

    const disposer = autorun(() => {
      i++;

      // autorun의 첫 실행에서 즉시 dispose하면 disposer가 아직 undefined이므로
      // setTimeout으로 다음 회차로 안전하게 연기
      const dispose = () => {
        disposed = true;

        if (i === 1) {
          // 첫 실행: 다음 회차에 dispose
          setTimeout(() => {
            disposer?.();
          }, 1);
        } else {
          // 두번째 이후: 즉시 dispose
          disposer?.();
        }
      };

      // 이미 dispose된 경우 리턴
      if (disposed) {
        return;
      }

      const generator = this.currencyRegistry.getCurrencyRegistrar(
        this.chainId,
        denom
      );

      if (generator) {
        this.handleCurrencyRegistration({
          module,
          denom,
          generator,
          dispose,
        });
      } else {
        // registrar가 없으면 등록 불가능
        if (this.registrationInProgressCurrencyMap.get(denom)) {
          runInAction(() => {
            this.registrationInProgressCurrencyMap.delete(denom);
          });
        }
        dispose();
      }
    });
  }

  /**
   * currency 등록 진행
   */
  protected handleCurrencyRegistration(args: {
    module: ChainInfoModule;
    denom: string;
    generator: { value: AppCurrency | undefined; done: boolean };
    dispose: () => void;
  }): void {
    const { module, denom, generator, dispose } = args;
    const currency = generator.value;

    runInAction(() => {
      // 진행 중 상태 업데이트
      if (!generator.done) {
        this.registrationInProgressCurrencyMap.set(denom, true);
      }

      // currency가 있으면 등록
      if (currency) {
        const unknownDenom = this.findAndRemoveUnknownDenom(
          denom,
          generator.done
        );

        // reaction 모드에 따라 적절한 메서드로 추가
        if (!unknownDenom || unknownDenom.reaction) {
          this.addOrReplaceCurrency(module, currency);
        } else {
          this.addOrReplaceCurrencyNoReaction(module, currency);
        }
      }

      // 완료되면 진행 중 상태 제거
      if (generator.done) {
        this.registrationInProgressCurrencyMap.delete(denom);
      }
    });

    // 완료되면 dispose
    if (generator.done) {
      dispose();
    }
  }

  /**
   * unknownDenomMap에서 해당 denom 찾고, 완료되었으면 제거
   * @returns 찾은 unknownDenom 정보 (없으면 undefined)
   */
  protected findAndRemoveUnknownDenom(
    denom: string,
    shouldRemove: boolean
  ):
    | {
        denom: string;
        reaction: boolean;
      }
    | undefined {
    const unknownDenom = this.unknownDenomMap.get(denom);
    if (!unknownDenom) {
      return undefined;
    }

    if (shouldRemove) {
      this.unknownDenomMap.delete(denom);
    }
    return unknownDenom;
  }

  // Refactor Note: 불변성 유지를 위해 새로운 배열 생성 후 대체 (하지만 기존에도 action이 있어서 성능 상 리렌더링 문제는 없었을 것)
  @action
  protected addOrReplaceCurrency(
    module: ChainInfoModule,
    currency: AppCurrency
  ) {
    const currencyMap = this.getCurrencyMapByModule(module);
    const normalizedCoinMinimalDenom = DenomHelper.normalizeDenom(
      currency.coinMinimalDenom
    );

    const newRegisteredCurrencies =
      this.getRegisteredCurrencies(module).slice();

    if (currencyMap.has(normalizedCoinMinimalDenom)) {
      const index = newRegisteredCurrencies.findIndex(
        (cur) => cur.coinMinimalDenom === normalizedCoinMinimalDenom
      );
      if (index >= 0) {
        const prev = newRegisteredCurrencies[index];
        if (
          // If same, do nothing
          sortedJsonByKeyStringify(prev) !== sortedJsonByKeyStringify(currency)
        ) {
          newRegisteredCurrencies.splice(index, 1, currency);
          this.replaceRegisteredCurrencies(module, newRegisteredCurrencies);
        }
      }
    } else {
      newRegisteredCurrencies.push(currency);
      this.replaceRegisteredCurrencies(module, newRegisteredCurrencies);
    }
  }

  @action
  protected addOrReplaceCurrencyNoReaction(
    module: ChainInfoModule,
    currency: AppCurrency
  ) {
    if (module !== "cosmos") {
      return;
    }

    const normalizedCoinMinimalDenom = DenomHelper.normalizeDenom(
      currency.coinMinimalDenom
    );
    const currencyMap = this.getCurrencyMapByModule(module);
    const newRegisteredCurrencies =
      this.registeredCosmosCurrenciesNoReaction.slice();

    if (currencyMap.has(normalizedCoinMinimalDenom)) {
      const index = newRegisteredCurrencies.findIndex(
        (cur) => cur.coinMinimalDenom === normalizedCoinMinimalDenom
      );
      if (index >= 0) {
        const prev = newRegisteredCurrencies[index];
        if (
          // If same, do nothing
          sortedJsonByKeyStringify(prev) !== sortedJsonByKeyStringify(currency)
        ) {
          newRegisteredCurrencies.splice(index, 1, currency);
          this.replaceRegisteredCurrencies(module, newRegisteredCurrencies);
        }
      }
    } else {
      newRegisteredCurrencies.push(currency);
      this.replaceRegisteredCurrencies(module, newRegisteredCurrencies);
    }
  }

  protected getRegisteredCurrencies(module: ChainInfoModule): AppCurrency[] {
    switch (module) {
      case "cosmos":
        return this.registeredCosmosCurrencies;
      case "starknet":
        return this.registeredStarkentCurrencies;
      case "bitcoin":
        return this.registeredBitcoinCurrencies;
      case "evm":
        return this.registeredEvmCurrencies;
      default:
        throw new Error(`Unknown module: ${module}`);
    }
  }
  protected replaceRegisteredCurrencies(
    module: ChainInfoModule,
    currencies: AppCurrency[]
  ) {
    switch (module) {
      case "cosmos":
        this.registeredCosmosCurrencies = currencies;
        break;
      case "starknet":
        this.registeredStarkentCurrencies = currencies as ERC20Currency[];
        break;
      case "bitcoin":
        this.registeredBitcoinCurrencies = currencies;
        break;
      case "evm":
        this.registeredEvmCurrencies = currencies;
        break;
      default:
        throw new Error(`Unknown module: ${module}`);
    }
  }

  @action
  addCurrencies(module: ChainInfoModule, ...currencies: AppCurrency[]) {
    if (currencies.length === 0) {
      return;
    }

    switch (module) {
      case "cosmos":
        if (!("cosmos" in this._embedded)) {
          throw new Error(`No cosmos module for this chain: ${this.chainId}`);
        }

        for (const currency of currencies) {
          const normalizedCoinMinimalDenom = DenomHelper.normalizeDenom(
            currency.coinMinimalDenom
          );
          if (!this.cosmosCurrencyMap.has(normalizedCoinMinimalDenom)) {
            this.registeredCosmosCurrencies.push(currency);
          }
        }
        break;
      case "starknet":
        if (!("starknet" in this._embedded)) {
          throw new Error(`No starknet module for this chain: ${this.chainId}`);
        }

        for (const currency of currencies) {
          const normalizedCoinMinimalDenom = DenomHelper.normalizeDenom(
            currency.coinMinimalDenom
          );
          if (
            !this.starknetCurrencyMap.has(normalizedCoinMinimalDenom) &&
            "type" in currency &&
            currency.type === "erc20"
          ) {
            this.registeredStarkentCurrencies.push(currency);
          }
        }
        break;
      case "bitcoin":
        if (!("bitcoin" in this._embedded)) {
          throw new Error(`No bitcoin module for this chain: ${this.chainId}`);
        }

        for (const currency of currencies) {
          const normalizedCoinMinimalDenom = DenomHelper.normalizeDenom(
            currency.coinMinimalDenom
          );
          if (!this.bitcoinCurrencyMap.has(normalizedCoinMinimalDenom)) {
            this.registeredBitcoinCurrencies.push(currency);
          }
        }
        break;
      case "evm":
        if (!("evm" in this._embedded)) {
          throw new Error(`No evm module for this chain: ${this.chainId}`);
        }

        for (const currency of currencies) {
          const normalizedCoinMinimalDenom = DenomHelper.normalizeDenom(
            currency.coinMinimalDenom
          );
          if (!this.evmCurrencyMap.has(normalizedCoinMinimalDenom)) {
            this.registeredEvmCurrencies.push(currency);
          }
        }
        break;
      default:
        throw new Error(`Unknown module: ${module}`);
    }
  }

  @action
  removeCurrencies(module: ChainInfoModule, ...coinMinimalDenoms: string[]) {
    if (coinMinimalDenoms.length === 0) {
      return;
    }

    const map = new Map<string, boolean>();
    for (const coinMinimalDenom of coinMinimalDenoms) {
      map.set(coinMinimalDenom, true);
    }

    switch (module) {
      case "cosmos":
        if (!("cosmos" in this._embedded)) {
          throw new Error(`No cosmos module for this chain: ${this.chainId}`);
        }

        this.registeredCosmosCurrencies =
          this.registeredCosmosCurrencies.filter(
            (currency) => !map.get(currency.coinMinimalDenom)
          );
        break;
      case "starknet":
        if (!("starknet" in this._embedded)) {
          throw new Error(`No starknet module for this chain: ${this.chainId}`);
        }

        this.registeredStarkentCurrencies =
          this.registeredStarkentCurrencies.filter(
            (currency) => !map.get(currency.coinMinimalDenom)
          );
        break;
      case "bitcoin":
        if (!("bitcoin" in this._embedded)) {
          throw new Error(`No bitcoin module for this chain: ${this.chainId}`);
        }

        this.registeredBitcoinCurrencies =
          this.registeredBitcoinCurrencies.filter(
            (currency) => !map.get(currency.coinMinimalDenom)
          );
        break;
      case "evm":
        if (!("evm" in this._embedded)) {
          throw new Error(`No evm module for this chain: ${this.chainId}`);
        }

        this.registeredEvmCurrencies = this.registeredEvmCurrencies.filter(
          (currency) => !map.get(currency.coinMinimalDenom)
        );
        break;
      default:
        throw new Error(`Unknown module: ${module}`);
    }
  }

  @computed
  protected get cosmosCurrencyMap(): Map<string, AppCurrency> {
    const result: Map<string, AppCurrency> = new Map();
    if ("cosmos" in this._embedded) {
      for (const currency of this._embedded.cosmos.currencies) {
        result.set(currency.coinMinimalDenom, currency);
      }
    }
    for (const currency of this.registeredCosmosCurrencies) {
      result.set(
        DenomHelper.normalizeDenom(currency.coinMinimalDenom),
        currency
      );
    }
    return result;
  }

  // 일단 IBC asset 에서만 사용되는 것 같아서 Cosmos만 추가?
  @computed
  protected get cosmosCurrencyMapNoReaction(): Map<string, AppCurrency> {
    const result: Map<string, AppCurrency> = new Map();
    for (const currency of this.registeredCosmosCurrenciesNoReaction) {
      result.set(currency.coinMinimalDenom, currency);
    }
    return result;
  }

  @computed
  protected get starknetCurrencyMap(): Map<string, AppCurrency> {
    const result: Map<string, AppCurrency> = new Map();
    if ("starknet" in this._embedded) {
      for (const currency of this._embedded.starknet.currencies) {
        result.set(currency.coinMinimalDenom, currency);
      }
    }

    for (const currency of this.registeredStarkentCurrencies) {
      result.set(
        DenomHelper.normalizeDenom(currency.coinMinimalDenom),
        currency
      );
    }
    return result;
  }

  @computed
  protected get bitcoinCurrencyMap(): Map<string, AppCurrency> {
    const result: Map<string, AppCurrency> = new Map();
    if ("bitcoin" in this._embedded) {
      for (const currency of this._embedded.bitcoin.currencies) {
        result.set(currency.coinMinimalDenom, currency);
      }
    }

    for (const currency of this.registeredBitcoinCurrencies) {
      result.set(
        DenomHelper.normalizeDenom(currency.coinMinimalDenom),
        currency
      );
    }
    return result;
  }

  @computed
  protected get evmCurrencyMap(): Map<string, AppCurrency> {
    const result: Map<string, AppCurrency> = new Map();
    if ("evm" in this._embedded) {
      for (const currency of this._embedded.evm.currencies) {
        result.set(
          DenomHelper.normalizeDenom(currency.coinMinimalDenom),
          currency
        );
      }
    }

    for (const currency of this.registeredEvmCurrencies) {
      result.set(
        DenomHelper.normalizeDenom(currency.coinMinimalDenom),
        currency
      );
    }

    return result;
  }

  hasFeature(feature: string): boolean {
    if ("evm" in this._embedded) {
      return !!(
        "features" in this._embedded.evm &&
        this._embedded.evm.features?.includes(feature)
      );
    }
    if ("cosmos" in this._embedded) {
      return !!(
        "features" in this._embedded.cosmos &&
        this._embedded.cosmos.features?.includes(feature)
      );
    }
    return false;
  }
}

export class ChainStore<C extends ChainInfo = ChainInfo>
  implements IChainStore<C>
{
  @observable.ref
  protected _chainInfos: ChainInfoImpl<C>[] = [];
  @observable.ref
  protected _modularChainInfos: ModularChainInfo[] = [];
  @observable.ref
  protected _modularChainInfoImpls: ModularChainInfoImpl<ModularChainInfo>[] =
    [];

  @observable
  protected currencyRegistrars: CurrencyRegistrar[] = [];

  constructor(embedChainInfos: (C | ModularChainInfo)[]) {
    makeObservable(this);

    this.setEmbeddedChainInfos(embedChainInfos);

    keepAlive(this, "chainInfoMap");
    keepAlive(this, "modularChainInfoMap");
  }

  get chainInfos(): IChainInfoImpl<C>[] {
    return this._chainInfos;
  }

  get modularChainInfos(): ModularChainInfo[] {
    console.log(
      "ChainStore modularChainInfos getter:",
      this._modularChainInfos
    );
    return this._modularChainInfos;
  }

  get modularChainInfoImpls(): ModularChainInfoImpl<ModularChainInfo>[] {
    return this._modularChainInfoImpls;
  }

  @computed
  protected get chainInfoMap(): Map<string, ChainInfoImpl<C>> {
    const result: Map<string, ChainInfoImpl<C>> = new Map();
    for (const chainInfo of this._chainInfos) {
      result.set(ChainIdHelper.parse(chainInfo.chainId).identifier, chainInfo);
    }
    return result;
  }

  getChain(chainId: string): IChainInfoImpl<C> {
    const chainIdentifier = ChainIdHelper.parse(chainId);

    const chainInfo = this.chainInfoMap.get(chainIdentifier.identifier);

    if (!chainInfo) {
      throw new Error(`Unknown chain info: ${chainId}`);
    }

    return chainInfo;
  }

  hasChain(chainId: string): boolean {
    const chainIdentifier = ChainIdHelper.parse(chainId);

    return this.chainInfoMap.has(chainIdentifier.identifier);
  }

  @computed
  protected get modularChainInfoMap(): Map<string, ModularChainInfo> {
    const result: Map<string, ModularChainInfo> = new Map();
    for (const chainInfo of this._modularChainInfos) {
      result.set(ChainIdHelper.parse(chainInfo.chainId).identifier, chainInfo);
    }
    return result;
  }

  getModularChain(chainId: string): ModularChainInfo {
    const chainIdentifier = ChainIdHelper.parse(chainId);

    const chainInfo = this.modularChainInfoMap.get(chainIdentifier.identifier);

    if (!chainInfo) {
      throw new Error(`Unknown modular chain info: ${chainId}`);
    }

    return chainInfo;
  }

  hasModularChain(chainId: string): boolean {
    const chainIdentifier = ChainIdHelper.parse(chainId);

    return this.modularChainInfoMap.has(chainIdentifier.identifier);
  }

  @computed
  protected get modularChainInfoImplMap(): Map<
    string,
    ModularChainInfoImpl<ModularChainInfo>
  > {
    const result: Map<
      string,
      ModularChainInfoImpl<ModularChainInfo>
    > = new Map();
    for (const chainInfo of this._modularChainInfoImpls) {
      result.set(ChainIdHelper.parse(chainInfo.chainId).identifier, chainInfo);
    }
    return result;
  }

  getModularChainInfoImpl(
    chainId: string
  ): ModularChainInfoImpl<ModularChainInfo> {
    const chainIdentifier = ChainIdHelper.parse(chainId);

    const modularChainInfoImpl = this.modularChainInfoImplMap.get(
      chainIdentifier.identifier
    );

    if (!modularChainInfoImpl) {
      throw new Error(`Unknown modular chain info: ${chainId}`);
    }

    return modularChainInfoImpl;
  }

  @action
  protected setEmbeddedChainInfos(chainInfos: (C | ModularChainInfo)[]) {
    console.log("setEmbeddedChainInfos 호출됨 - 입력 chainInfos:", chainInfos);

    this._chainInfos = chainInfos
      .filter((chainInfo) => "currencies" in chainInfo || "cosmos" in chainInfo)
      .map((chainInfo) => {
        if ("cosmos" in chainInfo) {
          // TODO: 이거 타이핑이 불가능한데 일단 대충 넘어가도록 처리한 것임.
          //       chainInfo.cosmos는 ChainInfo 타입이기 때문에 C를 만족할 수 없다.
          chainInfo = chainInfo.cosmos as C;
        }
        if (!("currencies" in chainInfo)) {
          throw new Error("Can't happen");
        }

        const prev = this.chainInfoMap.get(
          ChainIdHelper.parse(chainInfo.chainId).identifier
        );
        if (prev) {
          prev.setEmbeddedChainInfo(chainInfo);
          return prev;
        }

        return new ChainInfoImpl(chainInfo, this);
      });

    this._modularChainInfos = chainInfos.map((chainInfo) => {
      if (
        "evm" in chainInfo &&
        chainInfo.evm &&
        "currencies" in chainInfo && // clarify if it's ChainInfo type
        this.isEvmOnlyChain(chainInfo.chainId)
      ) {
        return {
          chainId: chainInfo.chainId,
          chainName: chainInfo.chainName,
          chainSymbolImageUrl: chainInfo.chainSymbolImageUrl,
          evm: {
            ...chainInfo.evm,
            currencies: chainInfo.currencies,
            bip44: chainInfo.bip44,
            features: chainInfo.features,
          },
        };
      }
      if ("currencies" in chainInfo) {
        return {
          chainId: chainInfo.chainId,
          chainName: chainInfo.chainName,
          chainSymbolImageUrl: chainInfo.chainSymbolImageUrl,
          cosmos: chainInfo as C,
          ...(chainInfo.evm && {
            evm: {
              ...chainInfo.evm,
              currencies: chainInfo.currencies,
              bip44: chainInfo.bip44,
            },
          }),
        };
      }
      return chainInfo;
    });

    this._modularChainInfoImpls = chainInfos.map((chainInfo) => {
      const modularChainInfo = (() => {
        if (
          "evm" in chainInfo &&
          chainInfo.evm &&
          "currencies" in chainInfo &&
          this.isEvmOnlyChain(chainInfo.chainId)
        ) {
          return {
            chainId: chainInfo.chainId,
            chainName: chainInfo.chainName,
            chainSymbolImageUrl: chainInfo.chainSymbolImageUrl,
            evm: {
              ...chainInfo.evm,
              currencies: chainInfo.currencies,
              bip44: chainInfo.bip44,
              features: chainInfo.features,
            },
          };
        }
        if ("currencies" in chainInfo) {
          return {
            chainId: chainInfo.chainId,
            chainName: chainInfo.chainName,
            chainSymbolImageUrl: chainInfo.chainSymbolImageUrl,
            cosmos: chainInfo as C,
            ...(chainInfo.evm && {
              evm: {
                ...chainInfo.evm,
                currencies: chainInfo.currencies,
                bip44: chainInfo.bip44,
              },
            }),
          };
        }
        return chainInfo;
      })();

      const prev = this.modularChainInfoImplMap.get(
        ChainIdHelper.parse(chainInfo.chainId).identifier
      );
      if (prev) {
        prev.setEmbeddedModularChainInfo(modularChainInfo);
        return prev;
      }

      return new ModularChainInfoImpl(modularChainInfo, this);
    });

    console.log("setEmbeddedChainInfos 완료");
    console.log(
      "- 설정된 _modularChainInfoImpls:",
      this._modularChainInfoImpls.map((impl) => impl.embedded)
    );
  }

  @action
  protected setEmbeddedChainInfosV2(infos: {
    chainInfos: C[];
    modulrChainInfos: ModularChainInfo[];
  }) {
    console.log("setEmbeddedChainInfosV2 호출됨");
    console.log("- 입력 modulrChainInfos:", infos.modulrChainInfos);
    this._chainInfos = infos.chainInfos.map((chainInfo) => {
      const prev = this.chainInfoMap.get(
        ChainIdHelper.parse(chainInfo.chainId).identifier
      );
      if (prev) {
        prev.setEmbeddedChainInfo(chainInfo);
        return prev;
      }

      return new ChainInfoImpl(chainInfo, this);
    });
    this._modularChainInfos = infos.modulrChainInfos.map((chainInfo) => {
      if ("evm" in chainInfo) {
        return chainInfo;
      }

      if ("currencies" in chainInfo) {
        const cosmos = infos.chainInfos.find(
          (c) => c.chainId === chainInfo.chainId
        );
        if (!cosmos) {
          throw new Error("Can't find cosmos chain info");
        }

        return {
          chainId: cosmos.chainId,
          chainName: cosmos.chainName,
          chainSymbolImageUrl: cosmos.chainSymbolImageUrl,
          cosmos,
          ...(cosmos.evm && {
            evm: {
              ...cosmos.evm,
              currencies: cosmos.currencies,
              bip44: cosmos.bip44,
            },
          }),
        };
      }
      return chainInfo;
    });
    this._modularChainInfoImpls = infos.modulrChainInfos.map((chainInfo) => {
      const modularChainInfo = (() => {
        if ("currencies" in chainInfo) {
          const cosmos = infos.chainInfos.find(
            (c) => c.chainId === chainInfo.chainId
          );
          if (!cosmos) {
            throw new Error("Can't find cosmos chain info");
          }

          if (
            "evm" in cosmos &&
            cosmos.evm &&
            this.isEvmOnlyChain(cosmos.chainId)
          ) {
            return {
              chainId: cosmos.chainId,
              chainName: cosmos.chainName,
              chainSymbolImageUrl: cosmos.chainSymbolImageUrl,
              evm: {
                ...cosmos.evm,
                currencies: cosmos.currencies,
                bip44: cosmos.bip44,
              },
            };
          }

          return {
            chainId: cosmos.chainId,
            chainName: cosmos.chainName,
            chainSymbolImageUrl: cosmos.chainSymbolImageUrl,
            cosmos,
            ...(cosmos.evm && {
              evm: {
                ...cosmos.evm,
                currencies: cosmos.currencies,
                bip44: cosmos.bip44,
              },
            }),
          };
        }
        return chainInfo;
      })();

      const prev = this.modularChainInfoImplMap.get(
        ChainIdHelper.parse(chainInfo.chainId).identifier
      );
      if (prev) {
        prev.setEmbeddedModularChainInfo(modularChainInfo);
        return prev;
      }

      return new ModularChainInfoImpl(modularChainInfo, this);
    });

    console.log("setEmbeddedChainInfosV2 완료");
    console.log("- V2로 설정된 _modularChainInfos:", this._modularChainInfos);
    console.log(
      "- V2로 설정된 _modularChainInfoImpls:",
      this._modularChainInfoImpls
    );
  }

  getCurrencyRegistrar(
    chainId: string,
    coinMinimalDenom: string
  ):
    | {
        value: AppCurrency | undefined;
        done: boolean;
      }
    | undefined {
    for (let i = 0; i < this.currencyRegistrars.length; i++) {
      const registrar = this.currencyRegistrars[i];
      const generator = registrar(chainId, coinMinimalDenom);
      if (generator) {
        return generator;
      }
    }
    return undefined;
  }

  @action
  registerCurrencyRegistrar(registrar: CurrencyRegistrar): void {
    this.currencyRegistrars.push(registrar);
  }

  isEvmChain(chainId: string): boolean {
    const chainInfo = this.getChain(chainId);
    return chainInfo.evm != null;
  }

  isEvmOnlyChain(chainId: string): boolean {
    const chainIdLikeCAIP2 = chainId.split(":");
    return (
      this.isEvmChain(chainId) &&
      chainIdLikeCAIP2.length === 2 &&
      chainIdLikeCAIP2[0] === "eip155"
    );
  }

  isEvmOrEthermintLikeChain(chainId: string): boolean {
    const b = this.isEvmChain(chainId);
    if (b) {
      return true;
    }
    const chainInfo = this.getChain(chainId);

    const isEthermintLike =
      chainInfo.bip44.coinType === 60 ||
      !!chainInfo.features?.includes("eth-address-gen") ||
      !!chainInfo.features?.includes("eth-key-sign");

    return isEthermintLike;
  }
}
