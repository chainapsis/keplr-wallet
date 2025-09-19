import { Currency, AppCurrency, FeeCurrency, ERC20Currency } from "./currency";
import { BIP44 } from "./bip44";
import { Bech32Config } from "./bech32";
import { EVMInfo } from "./ethereum";

export interface ChainInfo {
  readonly rpc: string;
  readonly rest: string;
  readonly nodeProvider?: {
    readonly name: string;
    readonly email?: string;
    readonly discord?: string;
    readonly website?: string;
  };
  readonly chainId: string;
  readonly chainName: string;
  /**
   * This indicates the type of coin that can be used for stake.
   * You can get actual currency information from Currencies.
   */
  readonly stakeCurrency?: Currency;
  readonly walletUrl?: string;
  readonly walletUrlForStaking?: string;
  readonly bip44: BIP44;
  readonly alternativeBIP44s?: BIP44[];
  readonly bech32Config?: Bech32Config;

  readonly currencies: AppCurrency[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  readonly feeCurrencies: FeeCurrency[];

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

  readonly chainSymbolImageUrl?: string;

  readonly hideInUI?: boolean;

  readonly evm?: EVMInfo;

  readonly isTestnet?: boolean;
}

export type ChainInfoWithoutEndpoints = Omit<
  ChainInfo,
  "rest" | "rpc" | "nodeProvider" | "evm"
> & {
  readonly rest: undefined;
  readonly rpc: undefined;
  readonly nodeProvider: undefined;
  readonly evm?: Omit<EVMInfo, "rpc"> & {
    readonly rpc: undefined;
  };
};

export interface StarknetChainInfo {
  readonly chainId: string;
  readonly rpc: string;
  readonly currencies: ERC20Currency[];
  readonly ethContractAddress: string;
  readonly strkContractAddress: string;
}

export interface BitcoinChainInfo {
  readonly rpc: string;
  readonly rest: string;
  readonly chainId: string;
  readonly bip44: BIP44;
  readonly currencies: AppCurrency[];
}

export interface EVMNativeChainInfo {
  readonly rpc: string;
  readonly chainId: number;
  readonly websocket?: string;
  readonly currencies: AppCurrency[];
  readonly bip44: BIP44;
}

export type ChainInfoModule = "cosmos" | "starknet" | "bitcoin" | "evm";

export type ModularChainInfo =
  | {
      readonly chainId: string;
      readonly chainName: string;
      readonly chainSymbolImageUrl?: string;
      readonly isTestnet?: boolean;
      readonly cosmos: ChainInfo;
    }
  | {
      readonly chainId: string;
      readonly chainName: string;
      readonly chainSymbolImageUrl?: string;
      readonly isTestnet?: boolean;
      readonly starknet: StarknetChainInfo;
    }
  | {
      readonly chainId: string;
      readonly chainName: string;
      readonly chainSymbolImageUrl?: string;
      readonly linkedChainKey: string;
      readonly isTestnet?: boolean;
      readonly bitcoin: BitcoinChainInfo;
    }
  | {
      readonly chainId: string;
      readonly chainName: string;
      readonly chainSymbolImageUrl?: string;
      readonly isTestnet?: boolean;
      readonly evmNative: EVMNativeChainInfo;
    };
