import { Router } from "@keplr-wallet/router";
import { EnabledChainIdentifiersUpdatedMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ChainsUIForegroundService } from "./service";

export function chainsUIForegroundInit(
  router: Router,
  service: ChainsUIForegroundService
): void {
  router.registerMessage(EnabledChainIdentifiersUpdatedMsg);

  router.addHandler(ROUTE, getHandler(service));
}
