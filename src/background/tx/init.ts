import { MessageManager } from "../../common/message";
import {
  RequestBackgroundTxMsg,
  RequestBackgroundTxWithResultMsg
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: BackgroundTxKeeper
): void {
  messageManager.registerMessage(RequestBackgroundTxMsg);
  messageManager.registerMessage(RequestBackgroundTxWithResultMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
