import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  GetAutoLockAccountDurationMsg,
  UpdateAutoLockAccountDurationMsg,
  StartAutoLockMonitoringMsg,
} from "./messages";
import { AutoLockAccountService } from "./service";

export const getHandler: (service: AutoLockAccountService) => Handler = (
  service: AutoLockAccountService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetAutoLockAccountDurationMsg:
        return handleGetAutoLockAccountDurationMsg(service)(
          env,
          msg as GetAutoLockAccountDurationMsg
        );
      case UpdateAutoLockAccountDurationMsg:
        return handleUpdateAutoLockAccountDurationMsg(service)(
          env,
          msg as UpdateAutoLockAccountDurationMsg
        );
      case StartAutoLockMonitoringMsg:
        return handleStartAutoLockMonitoringMsg(service)(
          env,
          msg as StartAutoLockMonitoringMsg
        );
      default:
        throw new KeplrError("auto-lock-account", 100, "Unknown msg type");
    }
  };
};

const handleGetAutoLockAccountDurationMsg: (
  service: AutoLockAccountService
) => InternalHandler<GetAutoLockAccountDurationMsg> = (service) => {
  return () => {
    return service.getAutoLockDuration();
  };
};

const handleUpdateAutoLockAccountDurationMsg: (
  service: AutoLockAccountService
) => InternalHandler<UpdateAutoLockAccountDurationMsg> = (service) => {
  return (_, msg) => {
    if (!service.keyRingIsUnlocked) {
      throw new Error("Keyring is not unlocked");
    }

    return service.setDuration(msg.duration);
  };
};

const handleStartAutoLockMonitoringMsg: (
  service: AutoLockAccountService
) => InternalHandler<StartAutoLockMonitoringMsg> = (service) => {
  return () => {
    return service.startAppStateCheckTimer();
  };
};
