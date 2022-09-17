import { Router } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PhishingListService } from "./service";
import { CheckURLIsPhishingMsg } from "./messages";

export function init(router: Router, service: PhishingListService): void {
  router.registerMessage(CheckURLIsPhishingMsg);

  router.addHandler(ROUTE, getHandler(service));
}
