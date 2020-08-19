import { MessageManager } from "../../../common/message";
import {
  LedgerInitFailedMsg,
  LedgerInitResumedMsg,
  LedgerSignCompletedMsg
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { LedgerInitNotifyKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: LedgerInitNotifyKeeper
): void {
  messageManager.registerMessage(LedgerInitFailedMsg);
  messageManager.registerMessage(LedgerInitResumedMsg);
  messageManager.registerMessage(LedgerSignCompletedMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
