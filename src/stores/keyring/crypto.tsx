import scrypt from "scrypt-js";
import AES from "aes-js";
import { sha256 } from "sha.js";

const Buffer = require("buffer/").Buffer;

export class Crypto {
  public static async encrypt(text: string, password: string): Promise<string> {
    const digestPassword = await Crypto.hash(password);
    const key = Buffer.from(digestPassword, "hex");
    const buf = Buffer.from(text);

    const aesCtr = new AES.ModeOfOperation.ctr(key);
    return Buffer.from(aesCtr.encrypt(buf)).toString("hex");
  }

  public static async decrypt(
    cipher: string,
    password: string
  ): Promise<string> {
    const digestPassword = await Crypto.hash(password);
    const key = Buffer.from(digestPassword, "hex");
    const aesCtr = new AES.ModeOfOperation.ctr(key);
    return Buffer.from(aesCtr.decrypt(Buffer.from(cipher, "hex"))).toString();
  }

  public static async hash(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const buf = Buffer.from(text);
      const salt = Buffer.from(new sha256().update(buf).digest("hex"), "hex");

      scrypt(buf, salt, 1024, 8, 1, 32, (error, _, key) => {
        if (error) {
          reject(error);
          return;
        } else if (key) {
          resolve(Buffer.from(key).toString("hex"));
        }
      });
    });
  }
}
