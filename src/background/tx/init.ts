import { MessageManager } from "../../common/message";
import { RequestBackgroundTxMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingKeeper } from "../keyring/keeper";
import { BackgroundTxKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keyRingKeeper: KeyRingKeeper
): BackgroundTxKeeper {
  messageManager.registerMessage(RequestBackgroundTxMsg);

  const keeper = new BackgroundTxKeeper(keyRingKeeper);
  messageManager.addHandler(ROUTE, getHandler(keeper));
  return keeper;
}
