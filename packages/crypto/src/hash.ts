import { sha256 } from "@noble/hashes/sha2";
import { keccak_256 } from "@noble/hashes/sha3";

export class Hash {
  static sha256(data: Uint8Array): Uint8Array {
    return sha256(data);
  }

  static keccak256(data: Uint8Array): Uint8Array {
    return keccak_256(data);
  }

  static truncHashPortion(
    str: string,
    firstCharCount = str.length,
    endCharCount = 0
  ): string {
    return (
      str.substring(0, firstCharCount) +
      "…" +
      str.substring(str.length - endCharCount, str.length)
    );
  }
}
