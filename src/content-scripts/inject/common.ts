import { ChainInfo } from "../../background/chains";
import { SuggestChainInfoMsg } from "../../background/chains/messages";
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

const Buffer = require("buffer/").Buffer;

export class Keplr {
  async experimentalSuggestChain(chainInfo: ChainInfo) {
    const msg = new SuggestChainInfoMsg(chainInfo, true);
    await sendMessage(BACKGROUND_PORT, msg);
  }

  async requestTx(
    chainId: string,
    txBytes: Uint8Array,
    mode: "sync" | "async" | "commit"
  ): Promise<void> {
    const msg = new RequestBackgroundTxMsg(
      chainId,
      Buffer.from(txBytes).toString("hex"),
      mode
    );
    await sendMessage(BACKGROUND_PORT, msg);
  }

  async requestTxWithResult(
    chainId: string,
    txBytes: Uint8Array,
    mode: "sync" | "async" | "commit"
  ): Promise<ResultBroadcastTx | ResultBroadcastTxCommit> {
    const msg = new RequestBackgroundTxWithResultMsg(
      chainId,
      Buffer.from(txBytes).toString("hex"),
      mode
    );
    return await sendMessage(BACKGROUND_PORT, msg);
  }
}
