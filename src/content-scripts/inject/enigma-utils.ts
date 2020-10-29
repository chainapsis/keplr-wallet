import { sendMessage } from "../../common/message/send";
import {
  RequestDecryptMsg,
  ReqeustEncryptMsg
} from "../../background/secret-wasm";
import { BACKGROUND_PORT } from "../../common/message/constant";

const Buffer = require("buffer/").Buffer;

/**
 * KeplrEnigmaUtils duplicates the public methods that are supported on secretjs's EnigmaUtils class.
 */
export class KeplrEnigmaUtils {
  constructor(private readonly chainId: string) {}

  public async encrypt(
    contractCodeHash: string,
    msg: object
  ): Promise<Uint8Array> {
    // TODO: Set id.
    return Buffer.from(
      await sendMessage(
        BACKGROUND_PORT,
        new ReqeustEncryptMsg(this.chainId, contractCodeHash, msg)
      ),
      "hex"
    );
  }

  public async decrypt(
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return Buffer.from(
      await sendMessage(
        BACKGROUND_PORT,
        new RequestDecryptMsg(
          this.chainId,
          Buffer.from(ciphertext).toString("hex"),
          Buffer.from(nonce).toString("hex")
        )
      ),
      "hex"
    );
  }
}
