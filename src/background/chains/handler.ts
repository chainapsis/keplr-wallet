import { Env, Handler, InternalHandler, Message } from "../../common/message";
import { ChainsKeeper } from "./keeper";
import {
  ApproveAccessMsg,
  ApproveSuggestedChainInfoMsg,
  GetAccessOriginMsg,
  GetChainInfosMsg,
  GetReqeustAccessDataMsg,
  GetSuggestedChainInfoMsg,
  RejectAccessMsg,
  RejectSuggestedChainInfoMsg,
  RemoveAccessOriginMsg,
  ReqeustAccessMsg,
  SuggestChainInfoMsg
} from "./messages";
import { BIP44 } from "@chainapsis/cosmosjs/core/bip44";
import { ChainInfo } from "./types";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export const getHandler: (keeper: ChainsKeeper) => Handler = keeper => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetChainInfosMsg:
        return handleGetChainInfosMsg(keeper)(env, msg as GetChainInfosMsg);
      case SuggestChainInfoMsg:
        return handleSuggestChainInfoMsg(keeper)(
          env,
          msg as SuggestChainInfoMsg
        );
      case GetSuggestedChainInfoMsg:
        return handleGetSuggestedChainInfoMsg(keeper)(
          env,
          msg as GetSuggestedChainInfoMsg
        );
      case ApproveSuggestedChainInfoMsg:
        return handleApproveSuggestedChainInfoMsg(keeper)(
          env,
          msg as ApproveSuggestedChainInfoMsg
        );
      case RejectSuggestedChainInfoMsg:
        return handleRejectSuggestedChainInfoMsg(keeper)(
          env,
          msg as RejectSuggestedChainInfoMsg
        );
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

const handleSuggestChainInfoMsg: (
  keeper: ChainsKeeper
) => InternalHandler<SuggestChainInfoMsg> = keeper => {
  return async (env, msg) => {
    const chainInfo = msg.chainInfo as Writeable<ChainInfo>;
    // Should restore the prototype because BIP44 is the class.
    chainInfo.bip44 = Object.setPrototypeOf(chainInfo.bip44, BIP44.prototype);

    // And, always handle it as beta.
    chainInfo.beta = true;

    await keeper.suggestChainInfo(
      chainInfo,
      env.extensionBaseURL,
      msg.openPopup,
      msg.origin
    );
  };
};

const handleGetSuggestedChainInfoMsg: (
  keeper: ChainsKeeper
) => InternalHandler<GetSuggestedChainInfoMsg> = keeper => {
  return (_, msg) => {
    return keeper.getSuggestedChainInfo(msg.chainId);
  };
};

const handleApproveSuggestedChainInfoMsg: (
  keeper: ChainsKeeper
) => InternalHandler<ApproveSuggestedChainInfoMsg> = keeper => {
  return (_, msg) => {
    keeper.approveSuggestChain(msg.chainId);
  };
};

const handleRejectSuggestedChainInfoMsg: (
  keeper: ChainsKeeper
) => InternalHandler<RejectSuggestedChainInfoMsg> = keeper => {
  return (_, msg) => {
    keeper.rejectSuggestChain(msg.chainId);
  };
};

const handleRequestAccessMsg: (
  keeper: ChainsKeeper
) => InternalHandler<ReqeustAccessMsg> = keeper => {
  return async (env, msg) => {
    await keeper.requestAccess(env.extensionBaseURL, msg.id, msg.chainId, [
      msg.appOrigin
    ]);
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
