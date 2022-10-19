import { Bech32Address } from "@keplr-wallet/cosmos";

export enum WalletType {
  Multisig = "Multisig",
  Singlesig = "Singlesig",
}

export abstract class AbstractWallet {
  public abstract get id(): string;
  public abstract get type(): WalletType;
  public abstract get address(): string | null;
  public abstract get isReady(): boolean;

  public get shortenedAddress(): string | null {
    const address = this.address;
    return address ? Bech32Address.shortenAddress(address, 20) : null;
  }
}
