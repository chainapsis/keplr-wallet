import { Env, Handler, InternalHandler, Message } from "../../common/message";
import { TokensKeeper } from "./keeper";
import {
  AddTokenMsg,
  ApproveSuggestedTokenMsg,
  GetSecret20ViewingKey,
  RejectSuggestedTokenMsg,
  RemoveTokenMsg,
  SuggestTokenMsg
} from "./messages";

export const getHandler: (keeper: TokensKeeper) => Handler = keeper => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case SuggestTokenMsg:
        return handleSuggestTokenMsg(keeper)(env, msg as SuggestTokenMsg);
      case ApproveSuggestedTokenMsg:
        return handleApproveSuggestedTokenMsg(keeper)(
          env,
          msg as ApproveSuggestedTokenMsg
        );
      case RejectSuggestedTokenMsg:
        return handleRejectSuggestedTokenMsg(keeper)(
          env,
          msg as RejectSuggestedTokenMsg
        );
      case AddTokenMsg:
        return handleAddTokenMsg(keeper)(env, msg as AddTokenMsg);
      case RemoveTokenMsg:
        return handleRemoveTokenMsg(keeper)(env, msg as RemoveTokenMsg);
      case GetSecret20ViewingKey:
        return handleGetSecret20ViewingKey(keeper)(
          env,
          msg as GetSecret20ViewingKey
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleSuggestTokenMsg: (
  keeper: TokensKeeper
) => InternalHandler<SuggestTokenMsg> = keeper => {
  return async (env, msg) => {
    await keeper.checkAccessOrigin(
      env.extensionBaseURL,
      msg.chainId,
      msg.origin
    );

    await keeper.suggestToken(
      msg.chainId,
      env.extensionBaseURL,
      msg.contractAddress
    );
  };
};

const handleApproveSuggestedTokenMsg: (
  keeper: TokensKeeper
) => InternalHandler<ApproveSuggestedTokenMsg> = keeper => {
  return async (_, msg) => {
    keeper.approveSuggestedToken(msg.chainId);
  };
};

const handleRejectSuggestedTokenMsg: (
  keeper: TokensKeeper
) => InternalHandler<RejectSuggestedTokenMsg> = keeper => {
  return async (_, msg) => {
    keeper.rejectSuggestedToken(msg.chainId);
  };
};

const handleAddTokenMsg: (
  keeper: TokensKeeper
) => InternalHandler<AddTokenMsg> = keeper => {
  return async (_, msg) => {
    await keeper.addToken(msg.chainId, msg.currency);
  };
};

const handleRemoveTokenMsg: (
  keeper: TokensKeeper
) => InternalHandler<RemoveTokenMsg> = keeper => {
  return async (_, msg) => {
    await keeper.removeToken(msg.chainId, msg.currency);
  };
};

const handleGetSecret20ViewingKey: (
  keeper: TokensKeeper
) => InternalHandler<GetSecret20ViewingKey> = keeper => {
  return async (env, msg) => {
    await keeper.checkAccessOrigin(
      env.extensionBaseURL,
      msg.chainId,
      msg.origin
    );

    return await keeper.getSecret20ViewingKey(msg.chainId, msg.contractAddress);
  };
};
