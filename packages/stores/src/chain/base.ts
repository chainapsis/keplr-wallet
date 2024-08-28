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
} from "@keplr-wallet/types";
import { IChainInfoImpl, IChainStore, CurrencyRegistrar } from "./types";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { keepAlive } from "mobx-utils";
import { sortedJsonByKeyStringify } from "@keplr-wallet/common";

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
      let found = false;
      const prior = this.unknownDenomMap.get(coinMinimalDenom);
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

      if (this.currencyMap.has(coinMinimalDenom)) {
        continue;
      }

      if (this.currencyNoReactionMap.has(coinMinimalDenom)) {
        continue;
      }

      if (!found) {
        runInAction(() => {
          this.unknownDenoms.push({
            denom: coinMinimalDenom,
            reaction,
          });
          this.registrationInProgressCurrencyMap.set(coinMinimalDenom, true);
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
          coinMinimalDenom
        );
        if (generator) {
          const currency = generator.value;
          runInAction(() => {
            if (!generator.done) {
              this.registrationInProgressCurrencyMap.set(
                coinMinimalDenom,
                true
              );
            }

            if (currency) {
              const index = this.unknownDenoms.findIndex(
                (denom) => denom.denom === currency.coinMinimalDenom
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
                }
              }

              if (!prev || prev.reaction) {
                this.addOrReplaceCurrency(currency);
              } else {
                this.addOrReplaceCurrencyNoReaction(currency);
              }
            }

            if (generator.done) {
              this.registrationInProgressCurrencyMap.delete(coinMinimalDenom);
            }
          });

          if (generator.done) {
            dispose();
          }
        } else {
          if (this.registrationInProgressCurrencyMap.get(coinMinimalDenom)) {
            runInAction(() => {
              this.registrationInProgressCurrencyMap.delete(coinMinimalDenom);
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
      this.registeredCurrencies.push(currency);
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
      if (!currencyMap.has(currency.coinMinimalDenom)) {
        this.registeredCurrencies.push(currency);
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
      map.set(coinMinimalDenom, true);
    }

    this.registeredCurrencies = this.registeredCurrencies.filter(
      (currency) => !map.get(currency.coinMinimalDenom)
    );
  }

  /**
   * Currency를 반환한다.
   * 만약 해당 Currency가 없다면 unknown currency에 추가한다.
   * @param coinMinimalDenom
   */
  findCurrency(coinMinimalDenom: string): AppCurrency | undefined {
    if (this.currencyMap.has(coinMinimalDenom)) {
      return this.currencyMap.get(coinMinimalDenom);
    }
    if (this.currencyNoReactionMap.has(coinMinimalDenom)) {
      this.moveNoReactionCurrencyToReaction(coinMinimalDenom);
      return this.currencyNoReactionMap.get(coinMinimalDenom);
    }
    this.addUnknownDenoms(coinMinimalDenom);

    // Unknown denom can be registered synchronously in some cases.
    // For this case, re-try to get currency.
    if (this.currencyMap.has(coinMinimalDenom)) {
      return this.currencyMap.get(coinMinimalDenom);
    }
    if (this.currencyNoReactionMap.has(coinMinimalDenom)) {
      this.moveNoReactionCurrencyToReaction(coinMinimalDenom);
      return this.currencyNoReactionMap.get(coinMinimalDenom);
    }
  }

  findCurrencyWithoutReaction(
    coinMinimalDenom: string
  ): AppCurrency | undefined {
    if (this.currencyMap.has(coinMinimalDenom)) {
      return this.currencyMap.get(coinMinimalDenom);
    }
    if (this.currencyNoReactionMap.has(coinMinimalDenom)) {
      return this.currencyNoReactionMap.get(coinMinimalDenom);
    }
    this.addUnknownDenomsWithoutReaction(coinMinimalDenom);

    // Unknown denom can be registered synchronously in some cases.
    // For this case, re-try to get currency.
    if (this.currencyMap.has(coinMinimalDenom)) {
      return this.currencyMap.get(coinMinimalDenom);
    }
    if (this.currencyNoReactionMap.has(coinMinimalDenom)) {
      return this.currencyNoReactionMap.get(coinMinimalDenom);
    }
  }

  findCurrencyAsync(
    coinMinimalDenom: string
  ): Promise<AppCurrency | undefined> {
    if (this.currencyMap.has(coinMinimalDenom)) {
      return Promise.resolve(this.currencyMap.get(coinMinimalDenom));
    }
    this.addUnknownDenoms(coinMinimalDenom);

    let disposal: IReactionDisposer | undefined;

    return new Promise<AppCurrency | undefined>((resolve) => {
      disposal = autorun(() => {
        const registration =
          this.registrationInProgressCurrencyMap.get(coinMinimalDenom);
        if (!registration) {
          resolve(this.currencyMap.get(coinMinimalDenom));
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

  forceFindCurrencyWithoutReaction(coinMinimalDenom: string): AppCurrency {
    const currency = this.findCurrencyWithoutReaction(coinMinimalDenom);
    if (!currency) {
      return {
        coinMinimalDenom,
        coinDenom: coinMinimalDenom,
        coinDecimals: 0,
      };
    }
    return currency;
  }

  @action
  protected addOrReplaceCurrency(currency: AppCurrency) {
    if (this.currencyMap.has(currency.coinMinimalDenom)) {
      const index = this.registeredCurrencies.findIndex(
        (cur) => cur.coinMinimalDenom === currency.coinMinimalDenom
      );
      if (index >= 0) {
        const prev = this.registeredCurrencies[index];
        if (
          // If same, do nothing
          sortedJsonByKeyStringify(prev) !== sortedJsonByKeyStringify(currency)
        ) {
          this.registeredCurrencies.splice(index, 1, currency);
        }
      }
    } else {
      this.registeredCurrencies.push(currency);
    }
  }

  @action
  protected addOrReplaceCurrencyNoReaction(currency: AppCurrency) {
    if (this.currencyNoReactionMap.has(currency.coinMinimalDenom)) {
      const index = this.registeredCurrenciesNoReaction.findIndex(
        (cur) => cur.coinMinimalDenom === currency.coinMinimalDenom
      );
      if (index >= 0) {
        const prev = this.registeredCurrenciesNoReaction[index];
        if (
          // If same, do nothing
          sortedJsonByKeyStringify(prev) !== sortedJsonByKeyStringify(currency)
        ) {
          this.registeredCurrenciesNoReaction.splice(index, 1, currency);
        }
      }
    } else {
      this.registeredCurrenciesNoReaction.push(currency);
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

export class ModularChainInfoImpl<
  M extends ModularChainInfo = ModularChainInfo
> {
  @observable.ref
  protected _embedded: M;

  @observable.shallow
  protected registeredCosmosCurrencies: AppCurrency[] = [];
  @observable.shallow
  protected registeredStarkentCurrencies: ERC20Currency[] = [];

  constructor(
    embedded: M,
    protected readonly currencyRegistry: {
      getCurrencyRegistrar: CurrencyRegistrar;
    }
  ) {
    this._embedded = embedded;

    makeObservable(this);

    keepAlive(this, "cosmosCurrencyMap");
    keepAlive(this, "starknetCurrencyMap");
  }

  get embedded(): M {
    return this._embedded;
  }

  @action
  setEmbeddedModularChainInfo(embedded: M) {
    this._embedded = embedded;
  }

  get chainId(): string {
    return this._embedded.chainId;
  }

  getCurrencies(module: string): AppCurrency[] {
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
      default:
        throw new Error(`Unknown module: ${module}`);
    }
  }

  @action
  addCurrencies(module: string, currencies: AppCurrency[]) {
    if (currencies.length === 0) {
      return;
    }

    switch (module) {
      case "cosmos":
        if (!("cosmos" in this._embedded)) {
          throw new Error(`No cosmos module for this chain: ${this.chainId}`);
        }

        for (const currency of currencies) {
          if (!this.cosmosCurrencyMap.has(currency.coinMinimalDenom)) {
            this.registeredCosmosCurrencies.push(currency);
          }
        }
        break;
      case "starknet":
        if (!("starknet" in this._embedded)) {
          throw new Error(`No starknet module for this chain: ${this.chainId}`);
        }

        for (const currency of currencies) {
          if (
            !this.starknetCurrencyMap.has(currency.coinMinimalDenom) &&
            "type" in currency &&
            currency.type === "erc20"
          ) {
            this.registeredStarkentCurrencies.push(currency);
          }
        }
        break;
      default:
        throw new Error(`Unknown module: ${module}`);
    }
  }

  @action
  removeCurrencies(module: string, coinMinimalDenoms: string[]) {
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
      default:
        throw new Error(`Unknown module: ${module}`);
    }
  }

  @computed
  protected get cosmosCurrencyMap(): Map<string, AppCurrency> {
    const result: Map<string, AppCurrency> = new Map();
    if (!("cosmos" in this._embedded)) {
      throw new Error(`No cosmos module for this chain: ${this.chainId}`);
    }

    for (const currency of this._embedded.cosmos.currencies) {
      result.set(currency.coinMinimalDenom, currency);
    }
    return result;
  }

  @computed
  protected get starknetCurrencyMap(): Map<string, AppCurrency> {
    const result: Map<string, AppCurrency> = new Map();
    if (!("starknet" in this._embedded)) {
      throw new Error(`No starknet module for this chain: ${this.chainId}`);
    }

    for (const currency of this._embedded.starknet.currencies) {
      result.set(currency.coinMinimalDenom, currency);
    }
    return result;
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
  }

  get chainInfos(): IChainInfoImpl<C>[] {
    return this._chainInfos;
  }

  get modularChainInfos(): ModularChainInfo[] {
    return this._modularChainInfos;
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

  getModularChainImpl(chainId: string): ModularChainInfoImpl<ModularChainInfo> {
    const chainIdentifier = ChainIdHelper.parse(chainId);

    const modularChainInfoImpl = this.modularChainInfoImplMap.get(
      chainIdentifier.identifier
    );

    if (!modularChainInfoImpl) {
      throw new Error(`Unknown modular chain info: ${chainId}`);
    }

    return modularChainInfoImpl;
  }

  hasModularChain(chainId: string): boolean {
    const chainIdentifier = ChainIdHelper.parse(chainId);

    return this.modularChainInfoMap.has(chainIdentifier.identifier);
  }

  @action
  protected setEmbeddedChainInfos(chainInfos: (C | ModularChainInfo)[]) {
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
      if ("currencies" in chainInfo) {
        return {
          chainId: chainInfo.chainId,
          chainName: chainInfo.chainName,
          chainSymbolImageUrl: chainInfo.chainSymbolImageUrl,
          cosmos: chainInfo as C,
        };
      }
      return chainInfo;
    });
    this._modularChainInfoImpls = chainInfos.map((chainInfo) => {
      const modularChainInfo =
        "currencies" in chainInfo
          ? {
              chainId: chainInfo.chainId,
              chainName: chainInfo.chainName,
              chainSymbolImageUrl: chainInfo.chainSymbolImageUrl,
              cosmos: chainInfo as C,
            }
          : chainInfo;

      const prev = this.modularChainInfoImplMap.get(
        ChainIdHelper.parse(chainInfo.chainId).identifier
      );
      if (prev) {
        prev.setEmbeddedModularChainInfo(modularChainInfo);
        return prev;
      }

      return new ModularChainInfoImpl(modularChainInfo, this);
    });
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
}
