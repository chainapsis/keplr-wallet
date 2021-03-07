import { Router } from "@keplr-wallet/router";
import { PermissionService } from "./service";
import {
  EnableAccessMsg,
  GetPermissionOriginsMsg,
  RemovePermissionOrigin,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(router: Router, service: PermissionService): void {
  router.registerMessage(EnableAccessMsg);
  router.registerMessage(GetPermissionOriginsMsg);
  router.registerMessage(RemovePermissionOrigin);

  router.addHandler(ROUTE, getHandler(service));
}
