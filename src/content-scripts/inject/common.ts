import { ChainInfo } from "../../background/chains";
import { SuggestChainInfoMsg } from "../../background/chains/messages";
import { sendMessage } from "../../common/message/send";
import { BACKGROUND_PORT } from "../../common/message/constant";

export class Keplr {
  async experimentalSuggestChain(chainInfo: ChainInfo) {
    const msg = new SuggestChainInfoMsg(chainInfo, true);
    await sendMessage(BACKGROUND_PORT, msg);
  }
}
