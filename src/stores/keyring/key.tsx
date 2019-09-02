import { PrivKey } from "@everett-protocol/cosmosjs/crypto";

export class Key {
  constructor(private privateKey: PrivKey) {}

  public bech32Address(prefix: string): string {
    const address = this.privateKey.toPubKey().toAddress();
    return address.toBech32(prefix);
  }
}
