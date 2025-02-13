import { Router } from "@keplr-wallet/router";
import {
  GetPubkeyMsg,
  GetTxEncryptionKeyMsg,
  RequestEncryptMsg,
  RequestDecryptMsg,
} from "./messages";
import { SecretWasmService } from "./service";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: SecretWasmService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(GetPubkeyMsg);
  router.registerMessage(RequestEncryptMsg);
  router.registerMessage(RequestDecryptMsg);
  router.registerMessage(GetTxEncryptionKeyMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
