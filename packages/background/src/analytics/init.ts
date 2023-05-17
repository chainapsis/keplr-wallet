import { Router } from "@keplr-wallet/router";
import { GetAnalyticsIdMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { AnalyticsService } from "./service";

export function init(router: Router, service: AnalyticsService) {
  router.registerMessage(GetAnalyticsIdMsg);

  router.addHandler(ROUTE, getHandler(service));
}
