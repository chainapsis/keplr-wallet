import { Router } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { DirectTxExecutorService } from "./service";
import { GetDirectTxExecutorDataMsg } from "./messages";

export function init(router: Router, service: DirectTxExecutorService): void {
  router.registerMessage(GetDirectTxExecutorDataMsg);

  router.addHandler(ROUTE, getHandler(service));
}
