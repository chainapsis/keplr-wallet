import { Router } from "@keplr-wallet/router";
import { KeyRingCosmosService } from "./service";
import { GetCosmosKeyMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(router: Router, service: KeyRingCosmosService): void {
  router.registerMessage(GetCosmosKeyMsg);

  router.addHandler(ROUTE, getHandler(service));
}
