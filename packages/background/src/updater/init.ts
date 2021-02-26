import { Router } from "@keplr-wallet/router";
import { TryUpdateChainMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ChainUpdaterService } from "./service";

export function init(router: Router, service: ChainUpdaterService): void {
  router.registerMessage(TryUpdateChainMsg);

  router.addHandler(ROUTE, getHandler(service));
}
