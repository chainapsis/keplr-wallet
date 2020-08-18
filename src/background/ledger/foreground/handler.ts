import {
  Env,
  Handler,
  InternalHandler,
  Message
} from "../../../common/message";
import { LedgerInitFailedMsg, LedgerInitResumedMsg } from "./messages";
import { LedgerInitNotifyKeeper } from "./keeper";

export const getHandler: (keeper: LedgerInitNotifyKeeper) => Handler = (
  keeper: LedgerInitNotifyKeeper
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case LedgerInitFailedMsg:
        return handleLedgerInitFailedMsg(keeper)(
          env,
          msg as LedgerInitFailedMsg
        );
      case LedgerInitResumedMsg:
        return handleLedgerInitResumedMsg(keeper)(
          env,
          msg as LedgerInitResumedMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleLedgerInitFailedMsg: (
  keeper: LedgerInitNotifyKeeper
) => InternalHandler<LedgerInitFailedMsg> = keeper => {
  return (_env, _msg) => {
    return keeper.onInitFailed();
  };
};

const handleLedgerInitResumedMsg: (
  keeper: LedgerInitNotifyKeeper
) => InternalHandler<LedgerInitResumedMsg> = keeper => {
  return (_env, _msg) => {
    return keeper.onInitResumed();
  };
};
