import { MessageManager } from "../../common/message";
import {
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  CreateKeyMsg,
  SetPathMsg,
  GetKeyMsg,
  UnlockKeyRingMsg
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(messageManager: MessageManager) {
  messageManager.registerMessage(RestoreKeyRingMsg);
  messageManager.registerMessage(SaveKeyRingMsg);
  messageManager.registerMessage(CreateKeyMsg);
  messageManager.registerMessage(UnlockKeyRingMsg);
  messageManager.registerMessage(SetPathMsg);
  messageManager.registerMessage(GetKeyMsg);

  messageManager.addHandler(ROUTE, getHandler());
}
