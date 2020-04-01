import { Handler, InternalHandler, Message } from "../../common/message";
import { ChainsKeeper } from "./keeper";
import {
  ApproveAccessMsg,
  GetAccessOriginMsg,
  GetChainInfosMsg,
  GetReqeustAccessDataMsg,
  RejectAccessMsg,
  RemoveAccessOriginMsg,
  ReqeustAccessMsg
} from "./messages";

export const getHandler: (keeper: ChainsKeeper) => Handler = keeper => {
  return (msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetChainInfosMsg:
        return handleGetChainInfosMsg(keeper)(msg as GetChainInfosMsg);
      case ReqeustAccessMsg:
        return handleRequestAccessMsg(keeper)(msg as ReqeustAccessMsg);
      case ApproveAccessMsg:
        return handleApproveAccessMsg(keeper)(msg as ApproveAccessMsg);
      case RejectAccessMsg:
        return handleRejectAccessMsg(keeper)(msg as ReqeustAccessMsg);
      case GetReqeustAccessDataMsg:
        return handleGetRequestAccessDataMsg(keeper)(
          msg as GetReqeustAccessDataMsg
        );
      case GetAccessOriginMsg:
        return handleGetAccessOriginsMsg(keeper)(msg as GetAccessOriginMsg);
      case RemoveAccessOriginMsg:
        return handleRemoveAccessOriginMsg(keeper)(
          msg as RemoveAccessOriginMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetChainInfosMsg: (
  keeper: ChainsKeeper
) => InternalHandler<GetChainInfosMsg> = keeper => {
  return async () => {
    const chainInfos = await keeper.getChainInfos();
    return {
      chainInfos
    };
  };
};

const handleRequestAccessMsg: (
  keeper: ChainsKeeper
) => InternalHandler<ReqeustAccessMsg> = keeper => {
  return async msg => {
    await keeper.requestAccess(msg.id, msg.chainId, [msg.origin]);
  };
};

const handleApproveAccessMsg: (
  keeper: ChainsKeeper
) => InternalHandler<ApproveAccessMsg> = keeper => {
  return msg => {
    keeper.approveAccess(msg.id);
  };
};

const handleRejectAccessMsg: (
  keeper: ChainsKeeper
) => InternalHandler<RejectAccessMsg> = keeper => {
  return msg => {
    keeper.rejectAccess(msg.id);
  };
};

const handleGetRequestAccessDataMsg: (
  keeper: ChainsKeeper
) => InternalHandler<GetReqeustAccessDataMsg> = keeper => {
  return msg => {
    return keeper.getRequestAccessData(msg.id);
  };
};

const handleGetAccessOriginsMsg: (
  keeper: ChainsKeeper
) => InternalHandler<GetAccessOriginMsg> = keeper => {
  return async msg => {
    return await keeper.getAccessOriginWithoutEmbed(msg.chainId);
  };
};

const handleRemoveAccessOriginMsg: (
  keeper: ChainsKeeper
) => InternalHandler<RemoveAccessOriginMsg> = keeper => {
  return async msg => {
    await keeper.removeAccessOrigin(msg.chainId, msg.origin);
  };
};
