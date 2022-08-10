import { Currency, AppCurrency } from "./currency";
import { BIP44 } from "./bip44";
import { AxiosRequestConfig } from "axios";
import { Bech32Config } from "./bech32";

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
  readonly walletUrl?: string;
  readonly walletUrlForStaking?: string;
  readonly bip44: BIP44;
  readonly alternativeBIP44s?: BIP44[];
  readonly bech32Config: Bech32Config;

  readonly currencies: AppCurrency[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  readonly feeCurrencies: Currency[];
  /**
   * This is the coin type in slip-044.
   * This is used for fetching address from ENS if this field is set.
   *
   * ** Use the `bip44.coinType` field to set the coin type to generate the address. **
   *
   * @deprecated This field is likely to be changed. ENS will continue to be supported, but will change in the future to use other methods than this field. Because of the low usage of the ENS feature, the change is a low priority and it is not yet clear how it will change.
   */
  readonly coinType?: number;

  /**
   * This is used to set the fee of the transaction.
   * If this field is empty, it just use the default gas price step (low: 0.01, average: 0.025, high: 0.04).
   * And, set field's type as primitive number because it is hard to restore the prototype after deserialzing if field's type is `Dec`.
   */
  readonly gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };

  /**
   * Indicate the features supported by this chain. Ex) cosmwasm, secretwasm ...
   */
  readonly features?: string[];

  /**
   * Shows whether the blockchain is in production phase or beta phase.
   * Major features such as staking and sending are supported on staging blockchains, but without guarantee.
   * If the blockchain is in an early stage, please set it as beta.
   */
  readonly beta?: boolean;
}
