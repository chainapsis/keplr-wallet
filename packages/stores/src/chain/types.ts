import {
  AppCurrency,
  Bech32Config,
  BIP44,
  ChainInfo,
  Currency,
  FeeCurrency,
  ModularChainInfo,
  ChainInfoModule,
} from "@keplr-wallet/types";

export type CurrencyRegistrar = (
  chainId: string,
  coinMinimalDenom: string
) =>
  | {
      value: AppCurrency | undefined;
      done: boolean;
    }
  | undefined;

export interface ChainGetter<C extends ChainInfo = ChainInfo> {
  getChain(chainId: string): IChainInfoImpl<C>;
  hasChain(chainId: string): boolean;

  getModularChain(chainId: string): ModularChainInfo;
  hasModularChain(chainId: string): boolean;

  getModularChainInfoImpl(chainId: string): IModularChainInfoImpl;
}

export interface IChainStore<C extends ChainInfo = ChainInfo>
  extends ChainGetter<C> {
  readonly chainInfos: IChainInfoImpl<C>[];
  readonly modularChainInfos: ModularChainInfo[];
  readonly modularChainInfoImpls: IModularChainInfoImpl[];
}

export interface IChainInfoImpl<C extends ChainInfo = ChainInfo> {
  addUnknownDenoms(...coinMinimalDenoms: string[]): void;
  addUnknownDenomsWithoutReaction(...coinMinimalDenoms: string[]): void;
  findCurrency(
    coinMinimalDenom:
      | string
      | ((coinMinimalDenom: string) => boolean | null | undefined)
  ): AppCurrency | undefined;
  findCurrencyWithoutReaction(
    coinMinimalDenom: string
  ): AppCurrency | undefined;
  findCurrencyAsync(coinMinimalDenom: string): Promise<AppCurrency | undefined>;
  forceFindCurrency(coinMinimalDenom: string): AppCurrency;
  forceFindCurrencyWithoutReaction(coinMinimalDenom: string): AppCurrency;
  hasFeature(feature: string): boolean;
  removeCurrencies(...coinMinimalDenoms: string[]): void;
  addCurrencies(...currencies: AppCurrency[]): void;
  isCurrencyRegistrationInProgress(coinMinimalDenom: string): boolean;
  readonly embedded: C;
  readonly chainId: string;
  readonly chainIdentifier: string;
  readonly stakeCurrency: Currency | undefined;
  readonly currencies: AppCurrency[];
  readonly alternativeBIP44s: BIP44[] | undefined;
  readonly bech32Config: Bech32Config | undefined;
  readonly beta: boolean | undefined;
  readonly bip44: BIP44;
  readonly chainName: string;
  readonly features: string[];
  readonly feeCurrencies: FeeCurrency[];
  readonly rest: string;
  readonly rpc: string;
  readonly walletUrl: string | undefined;
  readonly walletUrlForStaking: string | undefined;
  readonly chainSymbolImageUrl: string | undefined;
  readonly evm:
    | {
        chainId: number;
        rpc: string;
      }
    | undefined;
  readonly hideInUI: boolean | undefined;
  readonly isTestnet: boolean | undefined;
}

export interface IModularChainInfoImpl<
  M extends ModularChainInfo = ModularChainInfo
> {
  readonly embedded: M;
  readonly chainId: string;
  readonly stakeCurrency: Currency | undefined;
  readonly feeCurrencies: FeeCurrency[] | undefined;

  getCurrencies(): AppCurrency[];
  getCurrenciesByModule(module: ChainInfoModule): AppCurrency[];
  addCurrencies(module: ChainInfoModule, ...currencies: AppCurrency[]): void;
  removeCurrencies(
    module: ChainInfoModule,
    ...coinMinimalDenoms: string[]
  ): void;
  findCurrency(coinMinimalDenom: string): AppCurrency | undefined;
  forceFindCurrency(coinMinimalDenom: string): AppCurrency;
  findCurrencyWithoutReaction(
    coinMinimalDenom: string
  ): AppCurrency | undefined;
  forceFindCurrencyWithoutReaction(coinMinimalDenom: string): AppCurrency;
  findCurrencyAsync(coinMinimalDenom: string): Promise<AppCurrency | undefined>;
  hasFeature(feature: string): boolean;
  addUnknownDenoms(args: {
    module: ChainInfoModule;
    coinMinimalDenoms: string[];
  }): void;
  addUnknownDenomsWithoutReaction(args: {
    module: ChainInfoModule;
    coinMinimalDenoms: string[];
  }): void;
  isCurrencyRegistrationInProgress(coinMinimalDenom: string): boolean;
}
