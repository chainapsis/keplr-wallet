import {
  EnableAccessMsg,
  GetPermissionOriginsMsg,
  RemovePermissionOrigin,
} from "./messages";
import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { PermissionService } from "./service";

export const getHandler: (service: PermissionService) => Handler = (
  service
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case EnableAccessMsg:
        return handleEnableAccessMsg(service)(env, msg as EnableAccessMsg);
      case GetPermissionOriginsMsg:
        return handleGetPermissionOriginsMsg(service)(
          env,
          msg as GetPermissionOriginsMsg
        );
      case RemovePermissionOrigin:
        return handleRemovePermissionOrigin(service)(
          env,
          msg as RemovePermissionOrigin
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleEnableAccessMsg: (
  service: PermissionService
) => InternalHandler<EnableAccessMsg> = (service) => {
  return async (env, msg) => {
    return await service.checkOrGrantBasicAccessPermission(
      env,
      msg.chainIds,
      msg.origin
    );
  };
};

const handleGetPermissionOriginsMsg: (
  service: PermissionService
) => InternalHandler<GetPermissionOriginsMsg> = (service) => {
  return (_, msg) => {
    return service.getPermissionOrigins(msg.chainId, msg.permissionType);
  };
};

const handleRemovePermissionOrigin: (
  service: PermissionService
) => InternalHandler<RemovePermissionOrigin> = (service) => {
  return async (_, msg) => {
    await service.removePermission(msg.chainId, msg.permissionType, [
      msg.permissionOrigin,
    ]);
  };
};
