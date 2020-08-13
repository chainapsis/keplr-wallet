import { MessageManager } from "../../common/message";
import { LedgerInitResumeMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { LedgerKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: LedgerKeeper
): void {
  messageManager.registerMessage(LedgerInitResumeMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
