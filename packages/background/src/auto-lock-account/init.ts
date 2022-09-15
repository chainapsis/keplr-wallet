import { Router } from "@keplr-wallet/router";
import {
  UpdateAutoLockAccountDurationMsg,
  GetAutoLockAccountDurationMsg,
  StartAutoLockMonitoringMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { AutoLockAccountService } from "./service";

export function init(router: Router, service: AutoLockAccountService): void {
  router.registerMessage(GetAutoLockAccountDurationMsg);
  router.registerMessage(UpdateAutoLockAccountDurationMsg);
  router.registerMessage(StartAutoLockMonitoringMsg);

  router.addHandler(ROUTE, getHandler(service));
}
