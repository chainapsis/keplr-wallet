import {
  AppCurrency,
  Bech32Config,
  BIP44,
  ChainInfo,
  Currency,
  FeeCurrency,
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
}

export interface IChainStore<C extends ChainInfo = ChainInfo>
  extends ChainGetter<C> {
  readonly chainInfos: IChainInfoImpl<C>[];
}

export interface IChainInfoImpl<C extends ChainInfo = ChainInfo> {
  addUnknownDenoms(...coinMinimalDenoms: string[]): void;
  findCurrency(
    coinMinimalDenom:
      | string
      | ((coinMinimalDenom: string) => boolean | null | undefined)
  ): AppCurrency | undefined;
  findCurrencyAsync(coinMinimalDenom: string): Promise<AppCurrency | undefined>;
  forceFindCurrency(coinMinimalDenom: string): AppCurrency;
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
  readonly bech32Config: Bech32Config;
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
}
