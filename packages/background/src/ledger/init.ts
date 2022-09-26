import { Router } from "@keplr-wallet/router";
import {
  LedgerGetAppInUseMsg,
  LedgerGetWebHIDFlagMsg,
  LedgerSetWebHIDFlagMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { LedgerService } from "./service";

export function init(router: Router, service: LedgerService): void {
  router.registerMessage(LedgerGetWebHIDFlagMsg);
  router.registerMessage(LedgerSetWebHIDFlagMsg);
  router.registerMessage(LedgerGetAppInUseMsg);

  router.addHandler(ROUTE, getHandler(service));
}
