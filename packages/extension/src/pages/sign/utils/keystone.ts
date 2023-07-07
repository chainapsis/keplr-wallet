import { Bech32Address } from "@keplr-wallet/cosmos";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";

export interface KeystoneUR {
  type: string;
  cbor: string;
}

export interface KeystoneKeys {
  [path: string]: {
    chain: string;
    name: string;
    pubKey: string;
  };
}

export function getPathFromAddress(
  keys: KeystoneKeys,
  bech32Address: string,
  prefix: string
): string | null {
  for (const path in keys) {
    if (Object.prototype.hasOwnProperty.call(keys, path)) {
      const key = keys[path];
      const pubkey = new PubKeySecp256k1(Buffer.from(key.pubKey, "hex"));
      const bech32AddressFromPubkey = new Bech32Address(
        pubkey.getCosmosAddress()
      );
      if (bech32AddressFromPubkey.toBech32(prefix) === bech32Address) {
        return path;
      }
    }
  }
  return null;
}
