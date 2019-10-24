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
  GetRequestedMessage,
  GetRegisteredChainMsg
} from "./messages";
import { KeyHex, KeyRingKeeper } from "./keeper";
import { Address } from "@everett-protocol/cosmosjs/crypto";

const Buffer = require("buffer/").Buffer;

export const getHandler: () => Handler = () => {
  const keeper = new KeyRingKeeper();

  return async (msg: Message) => {
    switch (msg.constructor) {
      case GetRegisteredChainMsg:
        return {
          chainInfos: keeper.getRegisteredChains()
        };
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
        keeper.setPath(
          setPathMsg.chainId,
          setPathMsg.account,
          setPathMsg.index
        );
        return {
          success: true
        };
      case GetKeyMsg:
        const getKeyMsg = msg as GetKeyMsg;
        if (getKeyMsg.origin) {
          keeper.checkAccessOrigin(getKeyMsg.chainId, getKeyMsg.origin);
        }

        const key = await keeper.getKey();

        const result: KeyHex = {
          algo: "secp256k1",
          pubKeyHex: Buffer.from(key.pubKey).toString("hex"),
          addressHex: Buffer.from(key.address).toString("hex"),
          bech32Address: new Address(key.address).toBech32(
            keeper.getChainInfo(getKeyMsg.chainId).bech32Config
              .bech32PrefixAccAddr
          )
        };
        return result;
      case RequestSignMsg:
        const requestSignMsg = msg as RequestSignMsg;
        if (requestSignMsg.origin) {
          keeper.checkAccessOrigin(
            requestSignMsg.chainId,
            requestSignMsg.origin
          );
        }

        await keeper.checkBech32Address(
          requestSignMsg.chainId,
          requestSignMsg.bech32Address
        );

        return {
          signatureHex: Buffer.from(
            await keeper.requestSign(
              requestSignMsg.chainId,
              new Uint8Array(Buffer.from(requestSignMsg.messageHex, "hex")),
              requestSignMsg.index,
              requestSignMsg.openPopup
            )
          ).toString("hex")
        };
      case GetRequestedMessage:
        const getRequestedMessageMsg = msg as GetRequestedMessage;

        const message = keeper.getRequestedMessage(
          getRequestedMessageMsg.index
        );

        return {
          chainId: message.chainId,
          messageHex: Buffer.from(message.message).toString("hex")
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
