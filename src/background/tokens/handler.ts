import { Env, Handler, InternalHandler, Message } from "../../common/message";
import { TokensKeeper } from "./keeper";
import { AddTokenMsg } from "./messages";

export const getHandler: (keeper: TokensKeeper) => Handler = keeper => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case AddTokenMsg:
        return handleAddTokenMsg(keeper)(env, msg as AddTokenMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleAddTokenMsg: (
  keeper: TokensKeeper
) => InternalHandler<AddTokenMsg> = keeper => {
  return async (_, msg) => {
    await keeper.addToken(msg.chainId, msg.currency);
  };
};
