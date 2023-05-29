import { Router } from "@keplr-wallet/router";
import {
  UpdateAutoLockAccountDurationMsg,
  GetAutoLockAccountDurationMsg,
  StartAutoLockMonitoringMsg,
  GetLockOnSleepMsg,
  SetLockOnSleepMsg,
  GetAutoLockStateMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { AutoLockAccountService } from "./service";

export function init(router: Router, service: AutoLockAccountService): void {
  router.registerMessage(GetAutoLockAccountDurationMsg);
  router.registerMessage(UpdateAutoLockAccountDurationMsg);
  router.registerMessage(StartAutoLockMonitoringMsg);
  router.registerMessage(GetLockOnSleepMsg);
  router.registerMessage(SetLockOnSleepMsg);
  router.registerMessage(GetAutoLockStateMsg);

  router.addHandler(ROUTE, getHandler(service));
}
