import { Router } from "@keplr-wallet/router";
import { KeyRingCosmosService } from "./service";
import {
  GetCosmosKeyMsg,
  GetCosmosKeysSettledMsg,
  RequestCosmosSignAminoADR36Msg,
  RequestCosmosSignAminoMsg,
  VerifyCosmosSignAminoADR36Msg,
  ComputeNotFinalizedMnemonicKeyAddressesMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(GetCosmosKeyMsg);
  router.registerMessage(GetCosmosKeysSettledMsg);
  router.registerMessage(RequestCosmosSignAminoMsg);
  router.registerMessage(RequestCosmosSignAminoADR36Msg);
  router.registerMessage(VerifyCosmosSignAminoADR36Msg);
  router.registerMessage(ComputeNotFinalizedMnemonicKeyAddressesMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
