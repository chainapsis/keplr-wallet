import type { AccountInterface, ProviderInterface } from "starknet";

export type AccountChangeEventHandler = (accounts: string[]) => void;

export type NetworkChangeEventHandler = (network?: string) => void;

export type WalletEvents =
  | {
      type: "accountsChanged";
      handler: AccountChangeEventHandler;
    }
  | {
      type: "networkChanged";
      handler: NetworkChangeEventHandler;
    };

export interface WatchAssetParameters {
  type: "ERC20";
  options: {
    address: string;
    symbol?: string;
    decimals?: number;
    image?: string;
    name?: string;
  };
}

export interface AddStarknetChainParameters {
  id: string;
  chainId: string;
  chainName: string;
  baseUrl: string;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  nativeCurrency?: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  iconUrls?: string[];
}

export interface SwitchStarknetChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
}

export interface IStarknetProvider {
  id: string;
  name: string;
  version: string;
  icon: string;

  isConnected: boolean;

  account?: AccountInterface;
  provider?: ProviderInterface;
  selectedAddress?: string;
  chainId?: string;

  request<T = unknown>({
    type,
    params,
  }: {
    type: string;
    params?: any;
  }): Promise<T>;
  enable(options?: { starknetVersion?: "v4" | "v5" }): Promise<string[]>;
  isPreauthorized(): Promise<boolean>;
  on<E extends WalletEvents>(event: E["type"], handleEvent: E["handler"]): void;
  off<E extends WalletEvents>(
    event: E["type"],
    handleEvent: E["handler"]
  ): void;
}
