import { Router } from "@keplr-wallet/router";
import { KeyRingEthereumService } from "./service";
import { RequestJsonRpcToEvmMsg, RequestSignEthereumMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: KeyRingEthereumService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(RequestSignEthereumMsg);
  router.registerMessage(RequestJsonRpcToEvmMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
