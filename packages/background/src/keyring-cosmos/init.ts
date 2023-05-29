import { Router } from "@keplr-wallet/router";
import { KeyRingCosmosService } from "./service";
import {
  GetCosmosKeyMsg,
  GetCosmosKeysSettledMsg,
  RequestCosmosSignAminoADR36Msg,
  RequestCosmosSignAminoMsg,
  RequestCosmosSignDirectMsg,
  VerifyCosmosSignAminoADR36Msg,
  ComputeNotFinalizedMnemonicKeyAddressesMsg,
  PrivilegeCosmosSignAminoWithdrawRewardsMsg,
  GetCosmosKeysForEachVaultSettledMsg,
  RequestSignEIP712CosmosTxMsg_v0,
  RequestICNSAdr36SignaturesMsg,
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
  router.registerMessage(RequestCosmosSignDirectMsg);
  router.registerMessage(VerifyCosmosSignAminoADR36Msg);
  router.registerMessage(ComputeNotFinalizedMnemonicKeyAddressesMsg);
  router.registerMessage(PrivilegeCosmosSignAminoWithdrawRewardsMsg);
  router.registerMessage(GetCosmosKeysForEachVaultSettledMsg);
  router.registerMessage(RequestSignEIP712CosmosTxMsg_v0);
  router.registerMessage(RequestICNSAdr36SignaturesMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
