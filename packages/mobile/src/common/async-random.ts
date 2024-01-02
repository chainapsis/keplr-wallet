import * as Crypto from "expo-crypto";
import { RNG } from "@keplr-wallet/crypto";

export const getRandomBytesAsync: RNG = async (array) => {
  if (array) {
    const random = await Crypto.getRandomBytesAsync(array.byteLength);

    const bytes = new Uint8Array(
      array.buffer,
      array.byteOffset,
      array.byteLength
    );

    for (let i = 0; i < random.length; i++) {
      bytes[i] = random[i];
    }
  }

  return array;
};
