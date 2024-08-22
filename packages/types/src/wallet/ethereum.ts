import EventEmitter from "events";

export interface IEthereumProvider extends EventEmitter {
  // It must be in the hexadecimal format used in EVM-based chains, not the format used in Tendermint nodes.
  readonly chainId: string | null;
  // It must be in the decimal format of chainId.
  readonly networkVersion: string | null;

  readonly selectedAddress: string | null;

  readonly isKeplr: boolean;
  readonly isMetaMask: boolean;

  isConnected(): boolean;

  request<T = unknown>({
    method,
    params,
    chainId,
  }: {
    method: string;
    params?: readonly unknown[] | Record<string, unknown>;
    chainId?: string;
  }): Promise<T>;

  enable(): Promise<string[]>;
  net_version(): Promise<string>;
}
