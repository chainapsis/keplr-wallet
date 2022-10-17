import { Bech32Address } from "@keplr-wallet/cosmos";

export abstract class AbstractWallet {
  public abstract get type(): "multisig" | "singlesig";
  public abstract get address(): string | null;
  public abstract get isReady(): boolean;

  public get shortenedAddress(): string | null {
    const address = this.address;
    return address ? Bech32Address.shortenAddress(address, 20) : null;
  }
}
