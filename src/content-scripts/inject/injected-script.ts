import {
  Key,
  WalletProvider
} from "@everett-protocol/cosmosjs/core/walletProvider";
import { Context } from "@everett-protocol/cosmosjs/core/context";
import { GetKeyMsg, RequestSignMsg } from "../../background/keyring";
import { postMessage } from "../../common/message";
import { BACKGROUND_PORT } from "../../common/message/constant";
import { KeyHex } from "../../background/keyring";

const Buffer = require("buffer/").Buffer;

export class InjectedWalletProvider implements WalletProvider {
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
      window.location.origin
    );
    const key: KeyHex = await postMessage(BACKGROUND_PORT, msg);
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
  async sign(
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
      true,
      // There is no need to set origin because this wallet provider is used in internal.
      window.location.origin
    );

    const result: {
      signatureHex: string;
    } = await postMessage(BACKGROUND_PORT, requestSignMsg);

    return new Uint8Array(Buffer.from(result.signatureHex, "hex"));
  }
}

window.cosmosJSWalletProvider = new InjectedWalletProvider();
