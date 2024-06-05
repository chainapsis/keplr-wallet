import { Router } from "@keplr-wallet/router";
import { KeyRingCosmosService } from "./service";
import {
  GetCosmosKeyMsg,
  GetCosmosKeysSettledMsg,
  RequestCosmosSignAminoADR36Msg,
  RequestCosmosSignAminoMsg,
  RequestCosmosSignDirectMsg,
  VerifyCosmosSignAminoADR36Msg,
  ComputeNotFinalizedKeyAddressesMsg,
  PrivilegeCosmosSignAminoWithdrawRewardsMsg,
  GetCosmosKeysForEachVaultSettledMsg,
  GetCosmosKeysForEachVaultWithSearchSettledMsg,
  RequestSignEIP712CosmosTxMsg_v0,
  RequestICNSAdr36SignaturesMsg,
  EnableVaultsWithCosmosAddressMsg,
  PrivilegeCosmosSignAminoDelegateMsg,
  RequestCosmosSignDirectAuxMsg,
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
  router.registerMessage(ComputeNotFinalizedKeyAddressesMsg);
  router.registerMessage(PrivilegeCosmosSignAminoWithdrawRewardsMsg);
  router.registerMessage(PrivilegeCosmosSignAminoDelegateMsg);
  router.registerMessage(GetCosmosKeysForEachVaultSettledMsg);
  router.registerMessage(GetCosmosKeysForEachVaultWithSearchSettledMsg);
  router.registerMessage(RequestSignEIP712CosmosTxMsg_v0);
  router.registerMessage(RequestICNSAdr36SignaturesMsg);
  router.registerMessage(EnableVaultsWithCosmosAddressMsg);
  router.registerMessage(RequestCosmosSignDirectAuxMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
