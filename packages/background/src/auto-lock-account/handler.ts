import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  GetAutoLockAccountIntervalMsg,
  UpdateAutoLockAccountIntervalMsg,
  UpdateAppLastUsedTimeMsg,
} from "./messages";
import { AutoLockAccountService } from "./service";

export const getHandler: (service: AutoLockAccountService) => Handler = (
  service: AutoLockAccountService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetAutoLockAccountIntervalMsg:
        return handleGetAutoLockAccountIntervalMsg(service)(
          env,
          msg as GetAutoLockAccountIntervalMsg
        );
      case UpdateAutoLockAccountIntervalMsg:
        return handleUpdateAutoLockAccountIntervalMsg(service)(
          env,
          msg as UpdateAutoLockAccountIntervalMsg
        );
      case UpdateAppLastUsedTimeMsg:
        return handleUpdateAppLastUsedTimeMsg(service)(
          env,
          msg as UpdateAppLastUsedTimeMsg
        );
      default:
        throw new KeplrError("auto-lock-account", 100, "Unknown msg type");
    }
  };
};

const handleGetAutoLockAccountIntervalMsg: (
  service: AutoLockAccountService
) => InternalHandler<GetAutoLockAccountIntervalMsg> = (service) => {
  return () => {
    return service.getAutoLockInterval();
  };
};

const handleUpdateAutoLockAccountIntervalMsg: (
  service: AutoLockAccountService
) => InternalHandler<UpdateAutoLockAccountIntervalMsg> = (service) => {
  return (_, msg) => {
    return service.updateAutoLockInterval(msg.interval);
  };
};

const handleUpdateAppLastUsedTimeMsg: (
  service: AutoLockAccountService
) => InternalHandler<UpdateAppLastUsedTimeMsg> = (service) => {
  return () => {
    return service.updateAppLastUsedTime();
  };
};
