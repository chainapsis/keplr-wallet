import { Router } from "@keplr-wallet/router";
import {
  GetEnabledChainIdentifiersMsg,
  ToggleChainsMsg,
  EnableChainsMsg,
  DisableChainsMsg,
  GetVaultsByEnabledChainMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ChainsUIService } from "./service";

export function init(router: Router, service: ChainsUIService): void {
  router.registerMessage(GetEnabledChainIdentifiersMsg);
  router.registerMessage(ToggleChainsMsg);
  router.registerMessage(EnableChainsMsg);
  router.registerMessage(DisableChainsMsg);
  router.registerMessage(GetVaultsByEnabledChainMsg);

  router.addHandler(ROUTE, getHandler(service));
}
