import { MessageManager } from "../../../common/message";
import { TxCommittedMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxNotifyKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: BackgroundTxNotifyKeeper
): void {
  messageManager.registerMessage(TxCommittedMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
