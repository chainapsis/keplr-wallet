import { MessageManager } from "../../common/message";
import {
  GetChainInfosMsg,
  ReqeustAccessMsg,
  ApproveAccessMsg,
  RejectAccessMsg,
  GetReqeustAccessDataMsg,
  GetAccessOriginMsg,
  RemoveAccessOriginMsg
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ChainsKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: ChainsKeeper
): void {
  messageManager.registerMessage(GetChainInfosMsg);
  messageManager.registerMessage(ReqeustAccessMsg);
  messageManager.registerMessage(ApproveAccessMsg);
  messageManager.registerMessage(RejectAccessMsg);
  messageManager.registerMessage(GetReqeustAccessDataMsg);
  messageManager.registerMessage(GetAccessOriginMsg);
  messageManager.registerMessage(RemoveAccessOriginMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
