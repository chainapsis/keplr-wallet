import {
  Key,
  WalletProvider
} from "@everett-protocol/cosmosjs/core/walletProvider";
import { Context } from "@everett-protocol/cosmosjs/core/context";
import {
  EnableKeyRingMsg,
  GetKeyMsg,
  KeyRingStatus,
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
import { ReqeustAccessMsg } from "../../background/chains/messages";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Manifest = require("../../manifest.json");

const Buffer = require("buffer/").Buffer;

export class InjectedWalletProvider implements WalletProvider {
  public readonly identifier: string = "keplr-extension";
  public readonly version: string = Manifest.version;

  /**
   * Request access to the user's accounts. Wallet can ask the user to approve or deny access. If user deny access, it will throw error.
   */
  async enable(context: Context): Promise<void> {
    const random = new Uint8Array(4);
    crypto.getRandomValues(random);
    const id = Buffer.from(random).toString("hex");

    await sendMessage(
      BACKGROUND_PORT,
      new ReqeustAccessMsg(id, context.get("chainId"), window.location.origin)
    );

    const msg = new EnableKeyRingMsg(context.get("chainId"));
    const result = await sendMessage(BACKGROUND_PORT, msg);
    if (result.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Keyring not unlocked");
    }
  }

  /**
   * Get array of keys that includes bech32 address string, address bytes and public key from wallet if user have approved the access.
   */
  async getKeys(context: Context): Promise<Key[]> {
    const msg = new GetKeyMsg(context.get("chainId"));
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

    const requestTxBuilderConfigMsg = new RequestTxBuilderConfigMsg(
      {
        chainId: context.get("chainId"),
        ...txBuilderConfigToPrimitive(config)
      },
      id,
      true
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

    const requestSignMsg = new RequestSignMsg(
      context.get("chainId"),
      id,
      bech32Address,
      Buffer.from(message).toString("hex"),
      true
    );

    const result = await sendMessage(BACKGROUND_PORT, requestSignMsg);

    return new Uint8Array(Buffer.from(result.signatureHex, "hex"));
  }
}

// Give a priority to production build.
if (process.env.NODE_ENV !== "production") {
  if (!window.cosmosJSWalletProvider) {
    window.cosmosJSWalletProvider = new InjectedWalletProvider();
  }
} else {
  window.cosmosJSWalletProvider = new InjectedWalletProvider();
}
