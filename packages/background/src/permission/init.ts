import { Router } from "@keplr-wallet/router";
import { PermissionService } from "./service";
import {
  AddPermissionOrigin,
  GetOriginPermittedChainsMsg,
  GetPermissionOriginsMsg,
  RemovePermissionOrigin,
  GetGlobalPermissionOriginsMsg,
  RemoveGlobalPermissionOriginMsg,
  ClearOriginPermissionMsg,
  ClearAllPermissionsMsg,
  GetAllPermissionDataPerOriginMsg,
  GetCurrentChainIdForEVMMsg,
  UpdateCurrentChainIdForEVMMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(router: Router, service: PermissionService): void {
  router.registerMessage(GetPermissionOriginsMsg);
  router.registerMessage(GetOriginPermittedChainsMsg);
  router.registerMessage(AddPermissionOrigin);
  router.registerMessage(RemovePermissionOrigin);
  router.registerMessage(GetGlobalPermissionOriginsMsg);
  router.registerMessage(RemoveGlobalPermissionOriginMsg);
  router.registerMessage(ClearOriginPermissionMsg);
  router.registerMessage(ClearAllPermissionsMsg);
  router.registerMessage(GetAllPermissionDataPerOriginMsg);
  router.registerMessage(GetCurrentChainIdForEVMMsg);
  router.registerMessage(UpdateCurrentChainIdForEVMMsg);

  router.addHandler(ROUTE, getHandler(service));
}
