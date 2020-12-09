import { SuggestingChainInfo } from "../../background/chains";
import {
  ReqeustAccessMsg,
  SuggestChainInfoMsg
} from "../../background/chains/messages";
import { sendMessage } from "../../common/message";
import { BACKGROUND_PORT } from "../../common/message/constant";
import {
  RequestBackgroundTxMsg,
  RequestBackgroundTxWithResultMsg
} from "../../background/tx";
import {
  ResultBroadcastTx,
  ResultBroadcastTxCommit
} from "@chainapsis/cosmosjs/rpc/tx";
import {
  EnableKeyRingMsg,
  GetKeyMsg,
  KeyRingStatus,
  RequestSignMsg,
  RequestTxBuilderConfigMsg
} from "../../background/keyring";
import {
  GetSecret20ViewingKey,
  SuggestTokenMsg
} from "../../background/tokens/messages";
import { TxBuilderConfigPrimitive } from "../../background/keyring/types";
import { toHex } from "@cosmjs/encoding";
import { BroadcastMode, BroadcastTxResult, StdTx } from "@cosmjs/launchpad";

const Buffer = require("buffer/").Buffer;

export class Keplr {
  async experimentalSuggestChain(chainInfo: SuggestingChainInfo) {
    const msg = new SuggestChainInfoMsg(chainInfo, true);
    await sendMessage(BACKGROUND_PORT, msg);
  }

  async enable(chainId: string) {
    const random = new Uint8Array(4);
    crypto.getRandomValues(random);
    const id = Buffer.from(random).toString("hex");

    await sendMessage(
      BACKGROUND_PORT,
      new ReqeustAccessMsg(id, chainId, window.location.origin)
    );

    const msg = new EnableKeyRingMsg(chainId);
    const result = await sendMessage(BACKGROUND_PORT, msg);
    if (result.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Keyring not unlocked");
    }
  }

  async getKey(chainId: string) {
    const msg = new GetKeyMsg(chainId);
    return await sendMessage(BACKGROUND_PORT, msg);
  }

  async getTxConfig(
    chainId: string,
    config: TxBuilderConfigPrimitive
  ): Promise<TxBuilderConfigPrimitive> {
    const bytes = new Uint8Array(4);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map(value => {
        return value.toString(16);
      })
      .join("");

    const msg = new RequestTxBuilderConfigMsg(
      {
        chainId,
        ...config
      },
      id,
      true
    );
    return (await sendMessage(BACKGROUND_PORT, msg)).config;
  }

  async sign(chainId: string, signer: string, message: Uint8Array) {
    const bytes = new Uint8Array(4);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map(value => {
        return value.toString(16);
      })
      .join("");

    const msg = new RequestSignMsg(chainId, id, signer, toHex(message), true);
    return await sendMessage(BACKGROUND_PORT, msg);
  }

  /**
   * Broadcast tx to the rest endpoint that Keplr knows.
   * @param chainId
   * @param stdTx
   * @param mode
   */
  async sendTx(
    chainId: string,
    stdTx: StdTx,
    mode: BroadcastMode
  ): Promise<BroadcastTxResult> {
    // TODO: Clear up the message for broadcasting tx to the rest endpoint.
    const msg = new RequestBackgroundTxWithResultMsg(
      chainId,
      Buffer.from(JSON.stringify(stdTx)).toString("hex"),
      mode === BroadcastMode.Block ? "commit" : mode,
      true
    );
    // TODO: Parse the `Uint8Array`.
    return (await sendMessage(BACKGROUND_PORT, msg)) as any;
  }

  async suggestToken(chainId: string, contractAddress: string) {
    await sendMessage(
      BACKGROUND_PORT,
      new SuggestTokenMsg(chainId, contractAddress)
    );
  }

  async requestTx(
    chainId: string,
    txBytes: Uint8Array,
    mode: "sync" | "async" | "commit",
    isRestAPI: boolean = false
  ): Promise<void> {
    const msg = new RequestBackgroundTxMsg(
      chainId,
      Buffer.from(txBytes).toString("hex"),
      mode,
      isRestAPI
    );
    await sendMessage(BACKGROUND_PORT, msg);
  }

  async requestTxWithResult(
    chainId: string,
    txBytes: Uint8Array,
    mode: "sync" | "async" | "commit",
    isRestAPI: boolean = false
  ): Promise<ResultBroadcastTx | ResultBroadcastTxCommit> {
    const msg = new RequestBackgroundTxWithResultMsg(
      chainId,
      Buffer.from(txBytes).toString("hex"),
      mode,
      isRestAPI
    );
    return await sendMessage(BACKGROUND_PORT, msg);
  }

  async getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string> {
    return await sendMessage(
      BACKGROUND_PORT,
      new GetSecret20ViewingKey(chainId, contractAddress)
    );
  }
}
