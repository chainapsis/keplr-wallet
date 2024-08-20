import { Router } from "@keplr-wallet/router";
import { KeyRingStarknetService } from "./service";
import {
  GetStarknetKeyMsg,
  GetStarknetKeysSettledMsg,
  RequestJsonRpcToStarknetMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: KeyRingStarknetService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(GetStarknetKeyMsg);
  router.registerMessage(GetStarknetKeysSettledMsg);
  router.registerMessage(RequestJsonRpcToStarknetMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
