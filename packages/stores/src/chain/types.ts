// import {
//   AppCurrency,
//   Bech32Config,
//   BIP44,
//   ChainInfo,
//   Currency,
// } from "@keplr-wallet/types";
//
// export interface ChainGetter<C extends ChainInfo = ChainInfo> {
//   getChain(chainId: string): IChainInfoImpl<C>;
//   hasChain(chainId: string): boolean;
// }
//
// export interface IChainStore<C extends ChainInfo = ChainInfo>
//   extends ChainGetter<C> {
//   readonly chainInfos: IChainInfoImpl<C>[];
// }
//
// export interface IChainInfoImpl<C extends ChainInfo = ChainInfo> {
//   addUnknownDenoms(...coinMinimalDenoms: string[]): void;
//   readonly embedded: C;
//   readonly chainId: string;
//   findCurrency(
//     coinMinimalDenom:
//       | string
//       | ((coinMinimalDenom: string) => boolean | null | undefined)
//   ): AppCurrency | undefined;
//   forceFindCurrency(coinMinimalDenom: string): AppCurrency;
//   readonly stakeCurrency: Currency;
//   readonly alternativeBIP44s: BIP44[] | undefined;
//   readonly bech32Config: Bech32Config;
//   readonly beta: boolean | undefined;
//   readonly bip44: BIP44;
//   readonly chainName: string;
//   readonly coinType: number | undefined;
//   readonly features: string[] | undefined;
//   readonly feeCurrencies: Currency[];
//   readonly gasPriceStep:
//     | { low: number; average: number; high: number }
//     | undefined;
//   readonly rest: string;
//   readonly rpc: string;
//   readonly walletUrl: string | undefined;
//   readonly walletUrlForStaking: string | undefined;
// }
