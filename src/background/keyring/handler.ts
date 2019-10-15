import { Handler, Message } from "../../common/message";
import {
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  CreateKeyMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  SetPathMsg,
  RequestSignMsg,
  ApproveSignMsg,
  RejectSignMsg,
  GetRequestedMessage
} from "./messages";
import { KeyHex, KeyRingKeeper } from "./keeper";
import { Address } from "@everett-protocol/cosmosjs/crypto";

const Buffer = require("buffer/").Buffer;

export const getHandler: () => Handler = () => {
  const keeper = new KeyRingKeeper();

  return async (msg: Message) => {
    switch (msg.constructor) {
      case RestoreKeyRingMsg:
        return {
          status: await keeper.restore()
        };
      case SaveKeyRingMsg:
        await keeper.save();
        return {
          success: true
        };
      case CreateKeyMsg:
        const createKeyMsg = msg as CreateKeyMsg;
        return {
          status: await keeper.createKey(
            createKeyMsg.mnemonic,
            createKeyMsg.password
          )
        };
      case UnlockKeyRingMsg:
        const unlockKeyRingMsg = msg as UnlockKeyRingMsg;
        return {
          status: await keeper.unlock(unlockKeyRingMsg.password)
        };
      case SetPathMsg:
        const setPathMsg = msg as SetPathMsg;
        keeper.setPath(setPathMsg.path);
        return {
          success: true
        };
      case GetKeyMsg:
        const getKeyMsg = msg as GetKeyMsg;
        const key = await keeper.getKey();

        const result: KeyHex = {
          algo: "secp256k1",
          pubKeyHex: Buffer.from(key.pubKey).toString("hex"),
          addressHex: Buffer.from(key.address).toString("hex"),
          bech32Address: new Address(key.address).toBech32(getKeyMsg.prefix)
        };
        return result;
      case RequestSignMsg:
        const requestSignMsg = msg as RequestSignMsg;

        return {
          signatureHex: Buffer.from(
            await keeper.requestSign(
              new Uint8Array(Buffer.from(requestSignMsg.messageHex, "hex")),
              requestSignMsg.index
            )
          ).toString("hex")
        };
      case GetRequestedMessage:
        const getRequestedMessageMsg = msg as GetRequestedMessage;

        return {
          messageHex: Buffer.from(
            keeper.getRequestedMessage(getRequestedMessageMsg.index)
          ).toString("hex")
        };
      case ApproveSignMsg:
        const approveSignMsg = msg as ApproveSignMsg;
        keeper.approveSign(approveSignMsg.index);
        return;
      case RejectSignMsg:
        const rejectSignMsg = msg as RejectSignMsg;
        keeper.rejectSign(rejectSignMsg.index);
        return;
      default:
        throw new Error("Unknown msg type");
    }
  };
};
