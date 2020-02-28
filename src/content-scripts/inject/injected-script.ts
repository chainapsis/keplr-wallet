import {
  Key,
  WalletProvider
} from "@everett-protocol/cosmosjs/core/walletProvider";
import { Context } from "@everett-protocol/cosmosjs/core/context";
import {
  EnableKeyRingMsg,
  GetKeyMsg,
  RequestSignMsg,
  RequestTxBuilderConfigMsg
} from "../../background/keyring";
import { sendMessage } from "../../common/message";
import { BACKGROUND_PORT } from "../../common/message/constant";
import { TxBuilderConfig } from "@everett-protocol/cosmosjs/core/txBuilder";
import {
  txBuilderConfigFromPrimitive,
  txBuilderConfigToPrimitive
} from "../../background/keyring/utils";

const Buffer = require("buffer/").Buffer;

export class InjectedWalletProvider implements WalletProvider {
  /**
   * Request access to the user's accounts. Wallet can ask the user to approve or deny access. If user deny access, it will throw error.
   */
  async enable(context: Context): Promise<void> {
    const msg = EnableKeyRingMsg.create(
      context.get("chainId"),
      window.location.origin
    );
    await sendMessage(BACKGROUND_PORT, msg);
  }

  /**
   * Get array of keys that includes bech32 address string, address bytes and public key from wallet if user have approved the access.
   */
  async getKeys(context: Context): Promise<Key[]> {
    const msg = GetKeyMsg.create(
      context.get("chainId"),
      window.location.origin
    );
    const key = await sendMessage(BACKGROUND_PORT, msg);
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
   * Request tx builder config from provider.
   * This is optional method.
   * If provider supports this method, tx builder will request tx config with prefered tx config that is defined by developer who uses cosmosjs.
   * Received tx builder config can be changed in the client. The wallet provider must verify that it is the same as the tx builder config sent earlier or warn the user before signing.
   */
  async getTxBuilderConfig(
    context: Context,
    config: TxBuilderConfig
  ): Promise<TxBuilderConfig> {
    const random = new Uint8Array(4);
    crypto.getRandomValues(random);
    const id = Buffer.from(random).toString("hex");

    const requestTxBuilderConfigMsg = RequestTxBuilderConfigMsg.create(
      {
        chainId: context.get("chainId"),
        ...txBuilderConfigToPrimitive(config)
      },
      id,
      true,
      window.location.origin
    );

    const result = await sendMessage(
      BACKGROUND_PORT,
      requestTxBuilderConfigMsg
    );

    return txBuilderConfigFromPrimitive(result.config);
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
    const id = Buffer.from(random).toString("hex");

    const requestSignMsg = RequestSignMsg.create(
      context.get("chainId"),
      id,
      bech32Address,
      Buffer.from(message).toString("hex"),
      true,
      window.location.origin
    );

    const result = await sendMessage(BACKGROUND_PORT, requestSignMsg);

    return new Uint8Array(Buffer.from(result.signatureHex, "hex"));
  }
}

window.cosmosJSWalletProvider = new InjectedWalletProvider();
