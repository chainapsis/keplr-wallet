import { Router } from "@keplr-wallet/router";
import { SendTxEthereumMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxEthereumService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: BackgroundTxEthereumService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(SendTxEthereumMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
