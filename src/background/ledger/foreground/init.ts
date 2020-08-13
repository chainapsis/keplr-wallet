import { MessageManager } from "../../../common/message";
import { LedgerInitFailedMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { LedgerInitNotifyKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: LedgerInitNotifyKeeper
): void {
  messageManager.registerMessage(LedgerInitFailedMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
