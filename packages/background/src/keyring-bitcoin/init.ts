import { Router } from "@keplr-wallet/router";
import { KeyRingBitcoinService } from "./service";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionInteractiveService } from "../permission-interactive";
import { RequestSignBitcoinMessage } from "./messages";

export function init(
  router: Router,
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(RequestSignBitcoinMessage);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
