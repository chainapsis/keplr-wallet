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
  RequestBitcoinGetAccountsMsg,
  RequestBitcoinRequestAccountsMsg,
  RequestBitcoinDisconnectMsg,
  RequestBitcoinGetNetworkMsg,
  RequestBitcoinSwitchNetworkMsg,
  RequestBitcoinGetChainMsg,
  RequestBitcoinSwitchChainMsg,
  RequestBitcoinGetPublicKeyMsg,
  RequestBitcoinGetBalanceMsg,
  RequestBitcoinGetInscriptionsMsg,
  RequestBitcoinSendBitcoinMsg,
  RequestBitcoinPushTxMsg,
  GetPreferredBitcoinPaymentTypeMsg,
  SetPreferredBitcoinPaymentTypeMsg,
  RequestBitcoinPushPsbtMsg,
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
  router.registerMessage(RequestBitcoinGetAccountsMsg);
  router.registerMessage(RequestBitcoinDisconnectMsg);
  router.registerMessage(RequestBitcoinRequestAccountsMsg);
  router.registerMessage(RequestBitcoinGetNetworkMsg);
  router.registerMessage(RequestBitcoinSwitchNetworkMsg);
  router.registerMessage(RequestBitcoinGetChainMsg);
  router.registerMessage(RequestBitcoinSwitchChainMsg);
  router.registerMessage(RequestBitcoinGetPublicKeyMsg);
  router.registerMessage(RequestBitcoinGetBalanceMsg);
  router.registerMessage(RequestBitcoinGetInscriptionsMsg);
  router.registerMessage(RequestBitcoinSendBitcoinMsg);
  router.registerMessage(RequestBitcoinPushTxMsg);
  router.registerMessage(RequestBitcoinPushPsbtMsg);
  router.registerMessage(GetPreferredBitcoinPaymentTypeMsg);
  router.registerMessage(SetPreferredBitcoinPaymentTypeMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
