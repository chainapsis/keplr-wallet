import {
  AddPermissionOrigin,
  ClearAllPermissionsMsg,
  ClearOriginPermissionMsg,
  GetAllPermissionDataPerOriginMsg,
  GetCurrentChainIdForEVMMsg,
  GetGlobalPermissionOriginsMsg,
  GetOriginPermittedChainsMsg,
  GetPermissionOriginsMsg,
  RemoveGlobalPermissionOriginMsg,
  RemovePermissionOrigin,
  UpdateCurrentChainIdForEVMMsg,
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
      case ClearOriginPermissionMsg:
        return handleClearOriginPermissionMsg(service)(
          env,
          msg as ClearOriginPermissionMsg
        );
      case ClearAllPermissionsMsg:
        return handleClearAllPermissionsMsg(service)(
          env,
          msg as ClearAllPermissionsMsg
        );
      case GetAllPermissionDataPerOriginMsg:
        return handleGetAllPermissionDataPerOriginMsg(service)(
          env,
          msg as GetAllPermissionDataPerOriginMsg
        );
      case GetCurrentChainIdForEVMMsg:
        return handleGetCurrentChainIdForEVMMsg(service)(
          env,
          msg as GetCurrentChainIdForEVMMsg
        );
      case UpdateCurrentChainIdForEVMMsg:
        return handleUpdateCurrentChainIdForEVMMsg(service)(
          env,
          msg as UpdateCurrentChainIdForEVMMsg
        );
      default:
        throw new KeplrError("permission", 120, "Unknown msg type");
    }
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
  return (_, msg) => {
    service.addPermission([msg.chainId], msg.permissionType, [
      msg.permissionOrigin,
    ]);
  };
};

const handleRemovePermissionOrigin: (
  service: PermissionService
) => InternalHandler<RemovePermissionOrigin> = (service) => {
  return (_, msg) => {
    service.removePermission(msg.chainId, msg.permissionType, [
      msg.permissionOrigin,
    ]);
  };
};

const handleGetGlobalPermissionOrigins: (
  service: PermissionService
) => InternalHandler<GetGlobalPermissionOriginsMsg> = (service) => {
  return (_, msg) => {
    return service.getGlobalPermissionOrigins(msg.permissionType);
  };
};

const handleRemoveGlobalPermissionOrigin: (
  service: PermissionService
) => InternalHandler<RemoveGlobalPermissionOriginMsg> = (service) => {
  return (_, msg) => {
    return service.removeGlobalPermission(msg.permissionType, [
      msg.permissionOrigin,
    ]);
  };
};

const handleClearOriginPermissionMsg: (
  service: PermissionService
) => InternalHandler<ClearOriginPermissionMsg> = (service) => {
  return (_, msg) => {
    service.removeAllTypePermission([msg.permissionOrigin]);
    service.removeAllTypeGlobalPermission([msg.permissionOrigin]);
  };
};

const handleClearAllPermissionsMsg: (
  service: PermissionService
) => InternalHandler<ClearAllPermissionsMsg> = (service) => {
  return () => {
    service.clearAllPermissions();
  };
};

const handleGetAllPermissionDataPerOriginMsg: (
  service: PermissionService
) => InternalHandler<GetAllPermissionDataPerOriginMsg> = (service) => {
  return () => {
    return service.getAllPermissionDataPerOrigin();
  };
};

const handleGetCurrentChainIdForEVMMsg: (
  service: PermissionService
) => InternalHandler<GetCurrentChainIdForEVMMsg> = (service) => {
  return (_, msg) => {
    return service.getCurrentChainIdForEVM(msg.permissionOrigin);
  };
};

const handleUpdateCurrentChainIdForEVMMsg: (
  service: PermissionService
) => InternalHandler<UpdateCurrentChainIdForEVMMsg> = (service) => {
  return (env, msg) => {
    service.updateCurrentChainIdForEVM(env, msg.permissionOrigin, msg.chainId);
  };
};
