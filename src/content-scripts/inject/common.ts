import { sendMessage } from "../../common/message/send";
import { BACKGROUND_PORT } from "../../common/message/constant";
import { ReqeustAccessMsg } from "../../background/chains/messages";
import { EnableKeyRingMsg, KeyRingStatus } from "../../background/keyring";

const Buffer = require("buffer/").Buffer;

export const Keplr = {
  enable: async (chainId: string) => {
    const random = new Uint8Array(4);
    crypto.getRandomValues(random);
    const id = Buffer.from(random).toString("hex");

    await sendMessage(
      BACKGROUND_PORT,
      new ReqeustAccessMsg(id, chainId, window.location.origin)
    );

    const msg = new EnableKeyRingMsg(chainId, window.location.origin);
    const result = await sendMessage(BACKGROUND_PORT, msg);
    if (result.status !== KeyRingStatus.UNLOCKED) {
      throw new Error("Keyring not unlocked");
    }
  }
};
