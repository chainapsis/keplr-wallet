import { MessageManager } from "../../../common/message";
import { KeyStoreChangedMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingNotifyKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: KeyRingNotifyKeeper
): void {
  messageManager.registerMessage(KeyStoreChangedMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
