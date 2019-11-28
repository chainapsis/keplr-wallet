import { MessageManager } from "../../common/message";
import {
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  CreateKeyMsg,
  SetPathMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  RequestSignMsg,
  GetRequestedMessage,
  ApproveSignMsg,
  RejectSignMsg,
  GetRegisteredChainMsg,
  LockKeyRingMsg,
  ClearKeyRingMsg
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(messageManager: MessageManager) {
  messageManager.registerMessage(GetRegisteredChainMsg);
  messageManager.registerMessage(RestoreKeyRingMsg);
  messageManager.registerMessage(SaveKeyRingMsg);
  messageManager.registerMessage(ClearKeyRingMsg);
  messageManager.registerMessage(CreateKeyMsg);
  messageManager.registerMessage(LockKeyRingMsg);
  messageManager.registerMessage(UnlockKeyRingMsg);
  messageManager.registerMessage(SetPathMsg);
  messageManager.registerMessage(GetKeyMsg);
  messageManager.registerMessage(RequestSignMsg);
  messageManager.registerMessage(GetRequestedMessage);
  messageManager.registerMessage(ApproveSignMsg);
  messageManager.registerMessage(RejectSignMsg);

  messageManager.addHandler(ROUTE, getHandler());
}
