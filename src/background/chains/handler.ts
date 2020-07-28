import { Env, Handler, InternalHandler, Message } from "../../common/message";
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
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetChainInfosMsg:
        return handleGetChainInfosMsg(keeper)(env, msg as GetChainInfosMsg);
      case ReqeustAccessMsg:
        return handleRequestAccessMsg(keeper)(env, msg as ReqeustAccessMsg);
      case ApproveAccessMsg:
        return handleApproveAccessMsg(keeper)(env, msg as ApproveAccessMsg);
      case RejectAccessMsg:
        return handleRejectAccessMsg(keeper)(env, msg as ReqeustAccessMsg);
      case GetReqeustAccessDataMsg:
        return handleGetRequestAccessDataMsg(keeper)(
          env,
          msg as GetReqeustAccessDataMsg
        );
      case GetAccessOriginMsg:
        return handleGetAccessOriginsMsg(keeper)(
          env,
          msg as GetAccessOriginMsg
        );
      case RemoveAccessOriginMsg:
        return handleRemoveAccessOriginMsg(keeper)(
          env,
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
  return async (_, msg) => {
    await keeper.requestAccess(msg.id, msg.chainId, [msg.appOrigin]);
  };
};

const handleApproveAccessMsg: (
  keeper: ChainsKeeper
) => InternalHandler<ApproveAccessMsg> = keeper => {
  return (_, msg) => {
    keeper.approveAccess(msg.id);
  };
};

const handleRejectAccessMsg: (
  keeper: ChainsKeeper
) => InternalHandler<RejectAccessMsg> = keeper => {
  return (_, msg) => {
    keeper.rejectAccess(msg.id);
  };
};

const handleGetRequestAccessDataMsg: (
  keeper: ChainsKeeper
) => InternalHandler<GetReqeustAccessDataMsg> = keeper => {
  return (_, msg) => {
    return keeper.getRequestAccessData(msg.id);
  };
};

const handleGetAccessOriginsMsg: (
  keeper: ChainsKeeper
) => InternalHandler<GetAccessOriginMsg> = keeper => {
  return async (_, msg) => {
    return await keeper.getAccessOriginWithoutEmbed(msg.chainId);
  };
};

const handleRemoveAccessOriginMsg: (
  keeper: ChainsKeeper
) => InternalHandler<RemoveAccessOriginMsg> = keeper => {
  return async (_, msg) => {
    await keeper.removeAccessOrigin(msg.chainId, msg.appOrigin);
  };
};
