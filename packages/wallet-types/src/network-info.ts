import { Currency, NativeCurrency } from "./currencies";
import { Bech32Config } from "@keplr-wallet/types";

/**
 * A BIP44 configuration
 */
export interface BIP44 {
  /**
   * The coin type value to be appended into the HD Path
   */
  readonly coinType: number;
}

/**
 * The network configuration represents all the information needed by the wallet in order to interact with a target
 * network
 */
export interface NetworkConfig {
  /**
   * The chain id of the network name
   */
  readonly chainId: string;

  /**
   * The human-readable name for the network
   */
  readonly chainName: string;

  /**
   * The network type
   */
  readonly networkType: "cosmos" | "evm";

  /**
   * The base RPC used for interacting with the network
   */
  readonly rpcUrl: string;

  /**
   * Cosmos only, optional: The URL to the GRPC interface for the network
   */
  readonly grpcUrl?: string;

  /**
   * @deprecated Cosmos only, optional: The URL to the REST or LCD interface
   */
  readonly restUrl?: string;

  /**
   * The type of the network, i.e. is it a main network or using for testing
   */
  readonly type?: "mainnet" | "testnet";

  /**
   * The status or maturity of the network. i.e. is it production quality or not
   */
  readonly status?: "alpha" | "beta" | "production";

  /**
   * The set of BIP44 configurations used for determining HD wallets.
   *
   * A valid configuration must have at least only entry in this list. The first entry in this list is considered the
   * primary BIP44 configuration. Additional BIP44 configurations are also permitted
   */
  readonly bip44s: BIP44[];

  /**
   * Cosmos only, required: The Bech32 prefixes that are required for the network
   */
  readonly bech32Config: Bech32Config;

  /**
   * The complete set of currencies that are known for the network
   */
  readonly currencies: Currency[];

  /**
   * The subset of the currencies that are allows for paying fees
   */
  readonly feeCurrencies: NativeCurrency[];

  /**
   * The native currency that is allowed for staking
   */
  readonly stakeCurrency: NativeCurrency;

  /**
   * The gas price configuration for the network
   */
  readonly gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };

  /**
   * Set of features enabled for the network.
   */
  readonly features?: string[];

  /**
   * Explorer url for the network
   */
  readonly explorerUrl?: string;

  /**
   * Network logo
   */
  readonly chainSymbolImageUrl?: string;
}
