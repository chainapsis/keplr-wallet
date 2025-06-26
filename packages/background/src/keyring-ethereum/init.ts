import { Router } from "@keplr-wallet/router";
import { KeyRingEthereumService } from "./service";
import {
  RequestJsonRpcToEvmMsg,
  RequestSignEthereumMsg,
  GetNewCurrentChainIdForEVMMsg,
  CheckNeedEnableAccessForEVMMsg,
  GetSupportedChainCapabilitiesForEVMMsg,
} from "./messages";
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
  router.registerMessage(GetNewCurrentChainIdForEVMMsg);
  router.registerMessage(CheckNeedEnableAccessForEVMMsg);
  router.registerMessage(GetSupportedChainCapabilitiesForEVMMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
