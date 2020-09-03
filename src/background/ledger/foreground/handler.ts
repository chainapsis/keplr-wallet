import {
  Env,
  Handler,
  InternalHandler,
  Message
} from "../../../common/message";
import {
  LedgerInitFailedMsg,
  LedgerInitResumedMsg,
  LedgerGetPublicKeyCompletedMsg,
  LedgerSignCompletedMsg
} from "./messages";
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
      case LedgerGetPublicKeyCompletedMsg:
        return handleGetPublicKeyCompletedMsg(keeper)(
          env,
          msg as LedgerGetPublicKeyCompletedMsg
        );
      case LedgerSignCompletedMsg:
        return handleLedgerSignCompletedMsg(keeper)(
          env,
          msg as LedgerSignCompletedMsg
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

const handleGetPublicKeyCompletedMsg: (
  keeper: LedgerInitNotifyKeeper
) => InternalHandler<LedgerGetPublicKeyCompletedMsg> = keeper => {
  return (_env, _msg) => {
    return keeper.onGetPublicKeyCompleted();
  };
};

const handleLedgerSignCompletedMsg: (
  keeper: LedgerInitNotifyKeeper
) => InternalHandler<LedgerSignCompletedMsg> = keeper => {
  return (_env, msg) => {
    return keeper.onSignCompleted(msg.rejected);
  };
};
