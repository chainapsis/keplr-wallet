import { BIP44 } from "@everett-protocol/cosmosjs/core/bip44";
import { Bech32Config } from "@everett-protocol/cosmosjs/core/bech32Config";

export interface ChainInfo {
  readonly rpc: string;
  readonly rest: string;
  readonly chainId: string;
  readonly chainName: string;
  /**
   * This indicates the type of coin that can be used for stake.
   * You can get actual currency information from Currencies.
   */
  readonly nativeCurrency: string;
  readonly walletUrl: string;
  readonly walletUrlForStaking?: string;
  readonly bip44: BIP44;
  readonly bech32Config: Bech32Config;

  readonly currencies: string[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  readonly feeCurrencies: string[];
  /**
   * This is the coin type in slip-044.
   * This is used for fetching address from ENS if this field is set.
   */
  readonly coinType?: number;
}

export interface AccessOrigin {
  chainId: string;
  origins: string[];
}
