import { MessageManager } from "../../common/message";
import {
  AddTokenMsg,
  ApproveSuggestedTokenMsg,
  GetSecret20ViewingKey,
  RejectSuggestedTokenMsg,
  SuggestTokenMsg
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { TokensKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: TokensKeeper
): void {
  messageManager.registerMessage(SuggestTokenMsg);
  messageManager.registerMessage(ApproveSuggestedTokenMsg);
  messageManager.registerMessage(RejectSuggestedTokenMsg);
  messageManager.registerMessage(AddTokenMsg);
  messageManager.registerMessage(GetSecret20ViewingKey);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
