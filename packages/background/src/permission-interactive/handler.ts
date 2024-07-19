import { PermissionInteractiveService } from "./service";
import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import {
  DisableAccessMsg,
  EnableAccessMsg,
  IsEnabledAccessMsg,
} from "./messages";

export const getHandler: (service: PermissionInteractiveService) => Handler = (
  service
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case EnableAccessMsg:
        return handleEnableAccessMsg(service)(env, msg as EnableAccessMsg);
      case DisableAccessMsg:
        return handleDisableAccessMsg(service)(env, msg as DisableAccessMsg);
      case IsEnabledAccessMsg:
        return handleIsEnabledAccessMsg(service)(
          env,
          msg as IsEnabledAccessMsg
        );
    }
  };
};

const handleEnableAccessMsg: (
  service: PermissionInteractiveService
) => InternalHandler<EnableAccessMsg> = (service) => {
  return async (env, msg) => {
    return await service.ensureEnabled(env, msg.chainIds, msg.origin);
  };
};

const handleDisableAccessMsg: (
  service: PermissionInteractiveService
) => InternalHandler<DisableAccessMsg> = (service) => {
  return (_, msg) => {
    return service.disable(msg.chainIds, msg.origin);
  };
};

const handleIsEnabledAccessMsg: (
  service: PermissionInteractiveService
) => InternalHandler<IsEnabledAccessMsg> = (service) => {
  return (env, msg) => {
    return service.isEnabled(env, msg.chainIds, msg.origin);
  };
};
