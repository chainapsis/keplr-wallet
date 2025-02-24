import { Router } from "@keplr-wallet/router";
import { KeyRingBitcoinService } from "./service";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionInteractiveService } from "../permission-interactive";
import {
  GetBitcoinKeyMsg,
  GetBitcoinKeysSettledMsg,
  GetBitcoinKeysForEachVaultSettledMsg,
  RequestSignBitcoinMessageMsg,
  RequestSignBitcoinPsbtMsg,
  RequestSignBitcoinPsbtsMsg,
} from "./messages";

export function init(
  router: Router,
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(GetBitcoinKeyMsg);
  router.registerMessage(GetBitcoinKeysSettledMsg);
  router.registerMessage(GetBitcoinKeysForEachVaultSettledMsg);
  router.registerMessage(RequestSignBitcoinMessageMsg);
  router.registerMessage(RequestSignBitcoinPsbtMsg);
  router.registerMessage(RequestSignBitcoinPsbtsMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
