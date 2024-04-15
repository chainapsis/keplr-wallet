import { Router } from "@keplr-wallet/router";
import { JsonRpcEthereumService } from "./service";
import { RequestJsonRpcEthereum } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: JsonRpcEthereumService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(RequestJsonRpcEthereum);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
