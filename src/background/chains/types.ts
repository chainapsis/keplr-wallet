import { BIP44 } from "@chainapsis/cosmosjs/core/bip44";
import { Bech32Config } from "@chainapsis/cosmosjs/core/bech32Config";

import { AxiosRequestConfig } from "axios";
import { Currency } from "../../common/currency";

export interface ChainInfo {
  readonly rpc: string;
  readonly rpcConfig?: AxiosRequestConfig;
  readonly rest: string;
  readonly restConfig?: AxiosRequestConfig;
  readonly chainId: string;
  readonly chainName: string;
  /**
   * This indicates the type of coin that can be used for stake.
   * You can get actual currency information from Currencies.
   */
  readonly stakeCurrency: Currency;
  readonly walletUrl: string;
  readonly walletUrlForStaking?: string;
  readonly bip44: BIP44;
  readonly bech32Config: Bech32Config;

  readonly currencies: Currency[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  readonly feeCurrencies: Currency[];
  /**
   * This is the coin type in slip-044.
   * This is used for fetching address from ENS if this field is set.
   */
  readonly coinType?: number;

  /**
   * Shows whether the blockchain is in production phase or beta phase.
   * Major features such as staking and sending are supported on staging blockchains, but without guarantee.
   * If the blockchain is in an early stage, please set it as beta.
   */
  readonly beta?: boolean;
}

export interface AccessOrigin {
  chainId: string;
  origins: string[];
}

export type ChainInfoWithEmbed = ChainInfo & {
  embeded: boolean;
};

export type SuggestedChainInfo = ChainInfo & {
  origin: string;
};
