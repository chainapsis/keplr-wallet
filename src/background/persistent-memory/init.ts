import { MessageManager } from "../../common/message";
import { GetPersistentMemoryMsg, SetPersistentMemoryMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(messageManager: MessageManager) {
  messageManager.registerMessage(SetPersistentMemoryMsg);
  messageManager.registerMessage(GetPersistentMemoryMsg);

  messageManager.addHandler(ROUTE, getHandler());
}
