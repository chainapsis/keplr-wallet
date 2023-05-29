import { Router } from "@keplr-wallet/router";
import { PermissionInteractiveService } from "./service";
import { EnableAccessMsg, DisableAccessMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(
  router: Router,
  service: PermissionInteractiveService
): void {
  router.registerMessage(EnableAccessMsg);
  router.registerMessage(DisableAccessMsg);

  router.addHandler(ROUTE, getHandler(service));
}
