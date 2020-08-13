import { Env, Handler, InternalHandler, Message } from "../../common/message";
import { LedgerInitResumeMsg } from "./messages";
import { LedgerKeeper } from "./keeper";

export const getHandler: (keeper: LedgerKeeper) => Handler = (
  keeper: LedgerKeeper
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case LedgerInitResumeMsg:
        return handleLedgerInitResumeMsg(keeper)(
          env,
          msg as LedgerInitResumeMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleLedgerInitResumeMsg: (
  keeper: LedgerKeeper
) => InternalHandler<LedgerInitResumeMsg> = keeper => {
  return (_env, _msg) => {
    return keeper.resumeInitLedger();
  };
};
