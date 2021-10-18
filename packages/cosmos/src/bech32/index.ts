import bech32 from "bech32";
import { Bech32Config } from "@keplr-wallet/types";

export class Bech32Address {
  static shortenAddress(bech32: string, maxCharacters: number): string {
    if (maxCharacters >= bech32.length) {
      return bech32;
    }

    const i = bech32.indexOf("1");
    const prefix = bech32.slice(0, i);
    const address = bech32.slice(i + 1);

    maxCharacters -= prefix.length;
    maxCharacters -= 3; // For "..."
    maxCharacters -= 1; // For "1"

    if (maxCharacters <= 0) {
      return "";
    }

    const mid = Math.floor(address.length / 2);
    let former = address.slice(0, mid);
    let latter = address.slice(mid);

    while (maxCharacters < former.length + latter.length) {
      if ((former.length + latter.length) % 2 === 1 && former.length > 0) {
        former = former.slice(0, former.length - 1);
      } else {
        latter = latter.slice(1);
      }
    }

    return prefix + "1" + former + "..." + latter;
  }

  static fromBech32(bech32Address: string, prefix?: string): Bech32Address {
    const decoded = bech32.decode(bech32Address);
    if (prefix && decoded.prefix !== prefix) {
      throw new Error("Unmatched prefix");
    }

    return new Bech32Address(new Uint8Array(decoded.words));
  }

  static validate(bech32Address: string, prefix?: string) {
    const { prefix: decodedPrefix } = bech32.decode(bech32Address);
    if (prefix && prefix !== decodedPrefix) {
      throw new Error(
        `Unexpected prefix (expected: ${prefix}, actual: ${decodedPrefix})`
      );
    }
  }

  static defaultBech32Config(
    mainPrefix: string,
    validatorPrefix: string = "val",
    consensusPrefix: string = "cons",
    publicPrefix: string = "pub",
    operatorPrefix: string = "oper"
  ): Bech32Config {
    return {
      bech32PrefixAccAddr: mainPrefix,
      bech32PrefixAccPub: mainPrefix + publicPrefix,
      bech32PrefixValAddr: mainPrefix + validatorPrefix + operatorPrefix,
      bech32PrefixValPub:
        mainPrefix + validatorPrefix + operatorPrefix + publicPrefix,
      bech32PrefixConsAddr: mainPrefix + validatorPrefix + consensusPrefix,
      bech32PrefixConsPub:
        mainPrefix + validatorPrefix + consensusPrefix + publicPrefix,
    };
  }

  constructor(public readonly address: Uint8Array) {}

  toBech32(prefix: string): string {
    const words = bech32.toWords(this.address);
    return bech32.encode(prefix, words);
  }
}
