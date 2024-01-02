import getRandomValues from "./get-random-values";
import { Buffer } from "buffer";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createHash = require("create-hash");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const createHmac = require("create-hmac");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const aes = require("browserify-cipher");

class Crypto {
  getRandomValues = getRandomValues;
  randomBytes = (size, callback) => {
    const buf = Buffer.from(getRandomValues(new Uint8Array(size)));
    if (callback) {
      callback(undefined, buf);
    } else {
      return buf;
    }
  };
  createHash = createHash;
  Hash = createHash;
  createHmac = createHmac;
  Hmac = createHmac;

  Cipher = aes["Cipher"];
  createCipher = aes["createCipher"];
  Cipheriv = aes["Cipheriv"];
  createCipheriv = aes["createCipheriv"];
  Decipher = aes["Decipher"];
  createDecipher = aes["createDecipher"];
  Decipheriv = aes["Decipheriv"];
  createDecipheriv = aes["createDecipheriv"];
  getCiphers = aes["getCiphers"];
  listCiphers = aes["listCiphers"];
}
const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();
module.exports = {
  ...webCrypto,
  polyfillWebCrypto: () => {
    if (typeof crypto === "undefined") {
      Object.defineProperty(window, "crypto", {
        configurable: true,
        enumerable: true,
        get: () => webCrypto,
      });
    }
  },
};
