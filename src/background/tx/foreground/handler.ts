import {
  Env,
  Handler,
  InternalHandler,
  Message
} from "../../../common/message";
import { TxCommittedMsg } from "./messages";
import { BackgroundTxNotifyKeeper } from "./keeper";

export const getHandler: (keeper: BackgroundTxNotifyKeeper) => Handler = (
  keeper: BackgroundTxNotifyKeeper
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case TxCommittedMsg:
        return handleTxCommittedMsg(keeper)(env, msg as TxCommittedMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleTxCommittedMsg: (
  keeper: BackgroundTxNotifyKeeper
) => InternalHandler<TxCommittedMsg> = keeper => {
  return (_env, msg) => {
    return keeper.onTxCommitted(msg.chainId);
  };
};
