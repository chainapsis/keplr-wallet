import { MessageManager } from "../../common/message";
import {
  GetChainInfosMsg,
  ReqeustAccessMsg,
  ApproveAccessMsg,
  RejectAccessMsg,
  GetReqeustAccessDataMsg,
  GetAccessOriginMsg,
  RemoveAccessOriginMsg,
  SuggestChainInfoMsg,
  ApproveSuggestedChainInfoMsg,
  RejectSuggestedChainInfoMsg,
  GetSuggestedChainInfoMsg,
  RemoveSuggestedChainInfoMsg,
  TryUpdateChainMsg
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ChainsKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: ChainsKeeper
): void {
  messageManager.registerMessage(GetChainInfosMsg);
  messageManager.registerMessage(SuggestChainInfoMsg);
  messageManager.registerMessage(GetSuggestedChainInfoMsg);
  messageManager.registerMessage(ApproveSuggestedChainInfoMsg);
  messageManager.registerMessage(RejectSuggestedChainInfoMsg);
  messageManager.registerMessage(RemoveSuggestedChainInfoMsg);
  messageManager.registerMessage(ReqeustAccessMsg);
  messageManager.registerMessage(ApproveAccessMsg);
  messageManager.registerMessage(RejectAccessMsg);
  messageManager.registerMessage(GetReqeustAccessDataMsg);
  messageManager.registerMessage(GetAccessOriginMsg);
  messageManager.registerMessage(RemoveAccessOriginMsg);
  messageManager.registerMessage(TryUpdateChainMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
