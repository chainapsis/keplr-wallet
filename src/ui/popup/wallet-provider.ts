import {
  Key,
  WalletProvider
} from "@everett-protocol/cosmosjs/core/walletProvider";
import { Context } from "@everett-protocol/cosmosjs/core/context";
import { GetKeyMsg, RequestSignMsg } from "../../background/keyring";
import { sendMessage } from "../../common/message";
import { BACKGROUND_PORT } from "../../common/message/constant";
import { KeyHex } from "../../background/keyring";

const Buffer = require("buffer/").Buffer;

export interface AccessApprover {
  onRequestSignature: (index: string) => void;
}

export class PopupWalletProvider implements WalletProvider {
  constructor(private accessApprover: AccessApprover) {}

  /**
   * Request access to the user's accounts. Wallet can ask the user to approve or deny access. If user deny access, it will throw error.
   */
  enable(_: Context): Promise<void> {
    // TODO
    return Promise.resolve();
  }

  /**
   * Get array of keys that includes bech32 address string, address bytes and public key from wallet if user have approved the access.
   */
  async getKeys(context: Context): Promise<Key[]> {
    const msg = GetKeyMsg.create(
      context.get("chainId"),
      // There is no need to set origin because this wallet provider is used in internal.
      ""
    );
    const key: KeyHex = await sendMessage(BACKGROUND_PORT, msg);
    return Promise.resolve([
      {
        algo: key.algo,
        bech32Address: key.bech32Address,
        pubKey: new Uint8Array(Buffer.from(key.pubKeyHex, "hex")),
        address: new Uint8Array(Buffer.from(key.addressHex, "hex"))
      }
    ]);
  }

  /**
   * Request signature from matched address if user have approved the access.
   */
  sign(
    context: Context,
    bech32Address: string,
    message: Uint8Array
  ): Promise<Uint8Array> {
    const random = new Uint8Array(4);
    crypto.getRandomValues(random);
    const index = Buffer.from(random).toString("hex");

    const requestSignMsg = RequestSignMsg.create(
      context.get("chainId"),
      index,
      bech32Address,
      Buffer.from(message).toString("hex"),
      false,
      // There is no need to set origin because this wallet provider is used in internal.
      ""
    );
    return new Promise<Uint8Array>((resolve, reject) => {
      sendMessage(BACKGROUND_PORT, requestSignMsg)
        .then(({ signatureHex }) => {
          resolve(new Uint8Array(Buffer.from(signatureHex, "hex")));
        })
        .catch(e => {
          reject(e);
        });

      this.accessApprover.onRequestSignature(index);
    });
  }
}
