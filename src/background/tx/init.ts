import { MessageManager } from "../../common/message";
import { RequestBackgroundTxMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: BackgroundTxKeeper
): void {
  messageManager.registerMessage(RequestBackgroundTxMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
