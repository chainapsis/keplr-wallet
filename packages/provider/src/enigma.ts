import { SecretUtils } from "secretjs/types/enigmautils";
import { Keplr } from "@keplr-wallet/types";

/**
 * KeplrEnigmaUtils duplicates the public methods that are supported on secretjs's EnigmaUtils class.
 */
export class KeplrEnigmaUtils implements SecretUtils {
  constructor(
    protected readonly chainId: string,
    protected readonly keplr: Keplr
  ) {}

  async getPubkey(): Promise<Uint8Array> {
    return await this.keplr.getEnigmaPubKey(this.chainId);
  }

  async getTxEncryptionKey(nonce: Uint8Array): Promise<Uint8Array> {
    return await this.keplr.getEnigmaTxEncryptionKey(this.chainId, nonce);
  }

  async encrypt(
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> {
    return await this.keplr.enigmaEncrypt(this.chainId, contractCodeHash, msg);
  }

  async decrypt(
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return await this.keplr.enigmaDecrypt(this.chainId, ciphertext, nonce);
  }
}
