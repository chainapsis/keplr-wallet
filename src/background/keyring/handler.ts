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
import { KeyRing } from "./keyring";
import { Address } from "@everett-protocol/cosmosjs/crypto";

const Buffer = require("buffer/").Buffer;

export interface KeyHex {
  algo: string;
  pubKeyHex: string;
  addressHex: string;
  bech32Address: string;
}

export const getHandler: () => Handler = () => {
  const keyRing = new KeyRing();
  let path = "";

  interface SignApproval {
    approve: boolean;
  }
  const signRequests: Map<
    string,
    { resolve: (value: SignApproval) => void; reject: (reason?: any) => void }
  > = new Map();
  const signMessages: Map<string, string> = new Map();

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

        const result: KeyHex = {
          algo: "secp256k1",
          pubKeyHex: Buffer.from(key.pubKey).toString("hex"),
          addressHex: Buffer.from(key.address).toString("hex"),
          bech32Address: new Address(key.address).toBech32(getKeyMsg.prefix)
        };
        return result;
      case RequestSignMsg:
        const requestSignMsg = msg as RequestSignMsg;

        if (
          signRequests.has(requestSignMsg.index) ||
          signMessages.has(requestSignMsg.index)
        ) {
          throw new Error("index exists");
        }

        const promise = new Promise<SignApproval>((resolve, reject) => {
          signRequests.set(requestSignMsg.index, {
            resolve,
            reject
          });
        });
        signMessages.set(requestSignMsg.index, requestSignMsg.messageHex);

        const tempSignIndex = requestSignMsg.index;

        const approval = await promise;
        if (approval.approve) {
          signRequests.delete(tempSignIndex);
          signMessages.delete(tempSignIndex);
          return {
            signatureHex: Buffer.from(
              keyRing.sign(path, Buffer.from(requestSignMsg.messageHex, "hex"))
            ).toString("hex")
          };
        } else {
          signRequests.delete(tempSignIndex);
          signMessages.delete(tempSignIndex);
          throw new Error("Signature rejected");
        }
      case GetRequestedMessage:
        const getRequestedMessageMsg = msg as GetRequestedMessage;
        const messageHex = signMessages.get(getRequestedMessageMsg.index);
        if (!messageHex) {
          throw new Error("Unknown sign request index");
        }

        return {
          messageHex
        };
      case ApproveSignMsg:
        const approveSignMsg = msg as ApproveSignMsg;
        const resolver = signRequests.get(approveSignMsg.index);
        if (!resolver) {
          throw new Error("Unknown sign request index");
        }

        resolver.resolve({ approve: true });
        return;
      case RejectSignMsg:
        const rejectSignMsg = msg as RejectSignMsg;
        const resolverReject = signRequests.get(rejectSignMsg.index);
        if (!resolverReject) {
          throw new Error("Unknown sign request index");
        }

        resolverReject.resolve({ approve: false });
        return;
      default:
        throw new Error("Unknown msg type");
    }
  };
};
