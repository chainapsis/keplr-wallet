import { Router } from "@keplr-wallet/router";
import {
  UpdateAutoLockAccountIntervalMsg,
  GetAutoLockAccountIntervalMsg,
  UpdateAppLastUsedTimeMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { AutoLockAccountService } from "./service";

export function init(router: Router, service: AutoLockAccountService): void {
  router.registerMessage(GetAutoLockAccountIntervalMsg);
  router.registerMessage(UpdateAutoLockAccountIntervalMsg);
  router.registerMessage(UpdateAppLastUsedTimeMsg);

  router.addHandler(ROUTE, getHandler(service));
}
