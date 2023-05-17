import { Router } from "@keplr-wallet/router";
import { PermissionService } from "./service";
import {
  AddPermissionOrigin,
  DisableAccessMsg,
  EnableAccessMsg,
  GetOriginPermittedChainsMsg,
  GetPermissionOriginsMsg,
  RemovePermissionOrigin,
  GetGlobalPermissionOriginsMsg,
  RemoveGlobalPermissionOriginMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(router: Router, service: PermissionService): void {
  router.registerMessage(EnableAccessMsg);
  router.registerMessage(DisableAccessMsg);
  router.registerMessage(GetPermissionOriginsMsg);
  router.registerMessage(GetOriginPermittedChainsMsg);
  router.registerMessage(AddPermissionOrigin);
  router.registerMessage(RemovePermissionOrigin);
  router.registerMessage(GetGlobalPermissionOriginsMsg);
  router.registerMessage(RemoveGlobalPermissionOriginMsg);

  router.addHandler(ROUTE, getHandler(service));
}
