import scrypt from "scrypt-js";
import AES from "aes-js";
import { sha256 } from "sha.js";

const Buffer = require("buffer/").Buffer;

export class Crypto {
  public static async encrypt(text: string, password: string): Promise<string> {
    const digestPassword = await Crypto.scrpyt(
      password,
      Crypto.sha256(Buffer.from(password))
    );
    const key = Buffer.from(digestPassword, "hex");
    const buf = Buffer.from(text);

    const aesCtr = new AES.ModeOfOperation.ctr(key);
    const cipher = Buffer.from(aesCtr.encrypt(buf));
    // Mac is sha256(last 16 bytes of hashed password + cipher), and it is concatenated to result cipher.
    const mac = Crypto.sha256(
      Buffer.concat([key.slice(key.length / 2), cipher])
    );
    return Buffer.concat([cipher, mac]).toString("hex");
  }

  public static async decrypt(
    cipher: string,
    password: string
  ): Promise<string> {
    const digestPassword = await Crypto.scrpyt(
      password,
      Crypto.sha256(Buffer.from(password))
    );
    const key = Buffer.from(digestPassword, "hex");
    const aesCtr = new AES.ModeOfOperation.ctr(key);

    console.log(cipher, cipher.length);
    const buf = Buffer.from(cipher, "hex");
    const actualCipher = buf.slice(0, buf.length - 32);
    const mac = buf.slice(buf.length - 32);

    const expectedMac = Crypto.sha256(
      Buffer.concat([key.slice(key.length / 2), actualCipher])
    );
    if (mac.toString("hex") !== expectedMac.toString("hex")) {
      throw new Error("Unmatched mac");
    }

    return Buffer.from(aesCtr.decrypt(actualCipher)).toString();
  }

  private static async scrpyt(text: string, salt: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const buf = Buffer.from(text);

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

  public static sha256(buf: Buffer): Buffer {
    return Buffer.from(new sha256().update(buf).digest("hex"), "hex");
  }
}
