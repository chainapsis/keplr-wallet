import { SuggestingChainInfo } from "../../background/chains";
import {
  ReqeustAccessMsg,
  SuggestChainInfoMsg
} from "../../background/chains/messages";
import { sendMessage } from "../../common/message/send";
import { BACKGROUND_PORT } from "../../common/message/constant";
import {
  RequestBackgroundTxMsg,
  RequestBackgroundTxWithResultMsg
} from "../../background/tx";
import {
  ResultBroadcastTx,
  ResultBroadcastTxCommit
} from "@chainapsis/cosmosjs/rpc/tx";
import { EnableKeyRingMsg, KeyRingStatus } from "../../background/keyring";
import {
  GetSecret20ViewingKey,
  SuggestTokenMsg
} from "../../background/tokens/messages";

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
