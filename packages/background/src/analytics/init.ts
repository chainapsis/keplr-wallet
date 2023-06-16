import { Router } from "@keplr-wallet/router";
import { GetAnalyticsIdMsg, SetDisableAnalyticsMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { AnalyticsService } from "./service";

export function init(router: Router, service: AnalyticsService) {
  router.registerMessage(GetAnalyticsIdMsg);
  router.registerMessage(SetDisableAnalyticsMsg);

  router.addHandler(ROUTE, getHandler(service));
}
