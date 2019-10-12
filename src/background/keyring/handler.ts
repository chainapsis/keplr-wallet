import { Handler, Message } from "../../common/message";
import {
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  CreateKeyMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  SetPathMsg
} from "./messages";
import { KeyRing } from "./keyring";
import { Key } from "@everett-protocol/cosmosjs/core/walletProvider";
import { Address } from "@everett-protocol/cosmosjs/crypto";

export const getHandler: () => Handler = () => {
  const keyRing = new KeyRing();
  let path = "";

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
      case SetPathMsg:
        const setPathMsg = msg as SetPathMsg;
        path = setPathMsg.path;
        return {
          success: true
        };
      case GetKeyMsg:
        if (!path) {
          throw new Error("path not set");
        }

        const getKeyMsg = msg as GetKeyMsg;
        const key = keyRing.getKey(path);

        const result: Key = {
          algo: "secp256k1",
          pubKey: key.pubKey,
          address: key.address,
          bech32Address: new Address(key.address).toBech32(getKeyMsg.prefix)
        };
        return result;
      default:
        throw new Error("Unknown msg type");
    }
  };
};
