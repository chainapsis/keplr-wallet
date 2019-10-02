import { Handler, Message } from "../../common/message";
import {
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  CreateKeyMsg,
  GetBech32AddressMsg,
  UnlockKeyRingMsg
} from "./messages";
import { KeyRing } from "./keyring";

export const getHandler: () => Handler = () => {
  const keyRing = new KeyRing();

  return async (msg: Message) => {
    switch (msg.constructor) {
      case RestoreKeyRingMsg:
        await keyRing.restore();
        return {
          status: keyRing.status
        };
      case SaveKeyRingMsg:
        await keyRing.save();
        return {
          success: true
        };
      case CreateKeyMsg:
        const createKeyMsg = msg as CreateKeyMsg;
        await keyRing.createKey(createKeyMsg.mnemonic, createKeyMsg.password);
        return {
          status: keyRing.status
        };
      case UnlockKeyRingMsg:
        const unlockKeyRingMsg = msg as UnlockKeyRingMsg;
        await keyRing.unlock(unlockKeyRingMsg.password);
        return {
          status: keyRing.status
        };
      case GetBech32AddressMsg:
        const getBech32AddressMsg = msg as GetBech32AddressMsg;
        const bech32Address = keyRing.bech32Address(
          getBech32AddressMsg.path,
          getBech32AddressMsg.prefix
        );
        return {
          bech32Address
        };
      default:
        throw new Error("Unknown msg type");
    }
  };
};
