import {
  AddPermissionOrigin,
  DisableAccessMsg,
  EnableAccessMsg,
  GetGlobalPermissionOriginsMsg,
  GetOriginPermittedChainsMsg,
  GetPermissionOriginsMsg,
  RemoveGlobalPermissionOriginMsg,
  RemovePermissionOrigin,
} from "./messages";
import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { PermissionService } from "./service";

export const getHandler: (service: PermissionService) => Handler = (
  service
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case EnableAccessMsg:
        return handleEnableAccessMsg(service)(env, msg as EnableAccessMsg);
      case DisableAccessMsg:
        return handleDisableAccessMsg(service)(env, msg as DisableAccessMsg);
      case GetPermissionOriginsMsg:
        return handleGetPermissionOriginsMsg(service)(
          env,
          msg as GetPermissionOriginsMsg
        );
      case GetOriginPermittedChainsMsg:
        return handleGetOriginPermittedChainsMsg(service)(
          env,
          msg as GetOriginPermittedChainsMsg
        );
      case AddPermissionOrigin:
        return handleAddPermissionOrigin(service)(
          env,
          msg as RemovePermissionOrigin
        );
      case RemovePermissionOrigin:
        return handleRemovePermissionOrigin(service)(
          env,
          msg as RemovePermissionOrigin
        );
      case GetGlobalPermissionOriginsMsg:
        return handleGetGlobalPermissionOrigins(service)(
          env,
          msg as GetGlobalPermissionOriginsMsg
        );
      case RemoveGlobalPermissionOriginMsg:
        return handleRemoveGlobalPermissionOrigin(service)(
          env,
          msg as RemoveGlobalPermissionOriginMsg
        );
      default:
        throw new KeplrError("permission", 120, "Unknown msg type");
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

const handleDisableAccessMsg: (
  service: PermissionService
) => InternalHandler<EnableAccessMsg> = (service) => {
  return async (env, msg) => {
    return await service.disable(env, msg.chainIds, msg.origin);
  };
};

const handleGetPermissionOriginsMsg: (
  service: PermissionService
) => InternalHandler<GetPermissionOriginsMsg> = (service) => {
  return (_, msg) => {
    return service.getPermissionOrigins(msg.chainId, msg.permissionType);
  };
};

const handleGetOriginPermittedChainsMsg: (
  service: PermissionService
) => InternalHandler<GetOriginPermittedChainsMsg> = (service) => {
  return (_, msg) => {
    return service.getOriginPermittedChains(
      msg.permissionOrigin,
      msg.permissionType
    );
  };
};

const handleAddPermissionOrigin: (
  service: PermissionService
) => InternalHandler<AddPermissionOrigin> = (service) => {
  return async (_, msg) => {
    await service.addPermission([msg.chainId], msg.permissionType, [
      msg.permissionOrigin,
    ]);
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

const handleGetGlobalPermissionOrigins: (
  service: PermissionService
) => InternalHandler<GetGlobalPermissionOriginsMsg> = (service) => {
  return async (_, msg) => {
    return service.getGlobalPermissionOrigins(msg.permissionType);
  };
};

const handleRemoveGlobalPermissionOrigin: (
  service: PermissionService
) => InternalHandler<RemoveGlobalPermissionOriginMsg> = (service) => {
  return async (_, msg) => {
    return service.removeGlobalPermission(msg.permissionType, [
      msg.permissionOrigin,
    ]);
  };
};
