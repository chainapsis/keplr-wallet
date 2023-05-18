import { Router } from "@keplr-wallet/router";
import { SendTxMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: BackgroundTxService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(SendTxMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
