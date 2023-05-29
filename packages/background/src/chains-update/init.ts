import { Router } from "@keplr-wallet/router";
import { TryUpdateEnabledChainInfosMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ChainsUpdateService } from "./service";

export function init(router: Router, service: ChainsUpdateService): void {
  router.registerMessage(TryUpdateEnabledChainInfosMsg);

  router.addHandler(ROUTE, getHandler(service));
}
