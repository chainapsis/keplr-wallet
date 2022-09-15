import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  LedgerGetAppInUseMsg,
  LedgerGetWebHIDFlagMsg,
  LedgerSetWebHIDFlagMsg,
} from "./messages";
import { LedgerService } from "./service";

export const getHandler: (service: LedgerService) => Handler = (
  service: LedgerService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case LedgerGetWebHIDFlagMsg:
        return handleLedgerGetWebHIDFlagMsg(service)(
          env,
          msg as LedgerGetWebHIDFlagMsg
        );
      case LedgerSetWebHIDFlagMsg:
        return handleLedgerSetWebHIDFlagMsg(service)(
          env,
          msg as LedgerSetWebHIDFlagMsg
        );
      case LedgerGetAppInUseMsg:
        return handleLedgerGetAppInUseMsg(service)(
          env,
          msg as LedgerGetAppInUseMsg
        );
      default:
        throw new KeplrError("ledger", 111, "Unknown msg type");
    }
  };
};

const handleLedgerGetWebHIDFlagMsg: (
  service: LedgerService
) => InternalHandler<LedgerGetWebHIDFlagMsg> = (service) => {
  return async (_env, _msg) => {
    return await service.getWebHIDFlag();
  };
};

const handleLedgerSetWebHIDFlagMsg: (
  service: LedgerService
) => InternalHandler<LedgerSetWebHIDFlagMsg> = (service) => {
  return async (_env, msg) => {
    return await service.setWebHIDFlag(msg.flag);
  };
};

const handleLedgerGetAppInUseMsg: (
  service: LedgerService
) => InternalHandler<LedgerGetAppInUseMsg> = (service) => {
  return async (_env, _msg) => {
    return await service.getLedgerAppInUse();
  };
};
