import { SecretUtils } from "secretjs/types/enigmautils";
import { MessageRequester, BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  GetPubkeyMsg,
  ReqeustEncryptMsg,
  RequestDecryptMsg,
} from "@keplr-wallet/background";

import { Buffer } from "buffer/";

/**
 * KeplrEnigmaUtils duplicates the public methods that are supported on secretjs's EnigmaUtils class.
 */
export class KeplrEnigmaUtils implements SecretUtils {
  constructor(
    protected readonly chainId: string,
    protected readonly requester: MessageRequester
  ) {}

  public getPubkey = async (): Promise<Uint8Array> => {
    return Buffer.from(
      await this.requester.sendMessage(
        BACKGROUND_PORT,
        new GetPubkeyMsg(this.chainId)
      ),
      "hex"
    );
  };

  public encrypt = async (
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> => {
    // TODO: Set id.
    return Buffer.from(
      await this.requester.sendMessage(
        BACKGROUND_PORT,
        new ReqeustEncryptMsg(this.chainId, contractCodeHash, msg)
      ),
      "hex"
    );
  };

  public decrypt = async (
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> => {
    if (!ciphertext || ciphertext.length === 0) {
      return new Uint8Array();
    }

    return Buffer.from(
      await this.requester.sendMessage(
        BACKGROUND_PORT,
        new RequestDecryptMsg(
          this.chainId,
          Buffer.from(ciphertext).toString("hex"),
          Buffer.from(nonce).toString("hex")
        )
      ),
      "hex"
    );
  };
}
