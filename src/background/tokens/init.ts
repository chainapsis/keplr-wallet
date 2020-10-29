import { MessageManager } from "../../common/message";
import { AddTokenMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { TokensKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: TokensKeeper
): void {
  messageManager.registerMessage(AddTokenMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
