import {
  Key,
  WalletProvider
} from "@everett-protocol/cosmosjs/core/walletProvider";
import { Context } from "@everett-protocol/cosmosjs/core/context";
import {
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

import delay from "delay";

const Buffer = require("buffer/").Buffer;

export interface FeeApprover {
  onRequestTxBuilderConfig: (index: string) => void;
}

export interface SignApprover {
  onRequestSignature: (index: string) => void;
}

export class PopupWalletProvider implements WalletProvider {
  /**
   * @param feeApprover If this field is null, skip fee approving.
   * @param signApprover If this field is null, skip sign approving.
   */
  constructor(
    private feeApprover?: FeeApprover,
    private signApprover?: SignApprover
  ) {}

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

    const requestTxBuilderConfig = RequestTxBuilderConfigMsg.create(
      {
        chainId: context.get("chainId"),
        ...txBuilderConfigToPrimitive(config)
      },
      id,
      false,
      // There is no need to set origin because this wallet provider is used in internal.
      "",
      this.feeApprover == null
    );

    // Send requestTxBuilderConfig message and execute fee approver after some delay if it is set.
    return txBuilderConfigFromPrimitive(
      (
        await Promise.all([
          (async () => {
            if (this.feeApprover) {
              await delay(100);
              this.feeApprover.onRequestTxBuilderConfig(id);
            }
          })(),
          sendMessage(BACKGROUND_PORT, requestTxBuilderConfig)
        ])
      )[1].config
    );
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
      false,
      // There is no need to set origin because this wallet provider is used in internal.
      "",
      this.signApprover == null
    );

    // Send requestSignMsg message and execute sign approver after some delay if it is set.
    return new Uint8Array(
      Buffer.from(
        (
          await Promise.all([
            (async () => {
              if (this.signApprover) {
                await delay(100);
                this.signApprover.onRequestSignature(id);
              }
            })(),
            sendMessage(BACKGROUND_PORT, requestSignMsg)
          ])
        )[1].signatureHex,
        "hex"
      )
    );
  }
}
