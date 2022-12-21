import { sha256 } from "sha.js";
import { keccak256 } from "@ethersproject/keccak256";
import { Buffer } from "buffer/";

export class Hash {
  static sha256(data: Uint8Array): Uint8Array {
    return new Uint8Array(new sha256().update(data).digest());
  }

  static keccak256(data: Uint8Array): Uint8Array {
    return Buffer.from(keccak256(data).replace("0x", ""), "hex");
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
