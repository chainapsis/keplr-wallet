import { Router } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { PhishingListService } from "./service";
import {
  CheckBadTwitterIdMsg,
  CheckURLIsPhishingMsg,
  URLTempAllowMsg,
} from "./messages";

export function init(router: Router, service: PhishingListService): void {
  router.registerMessage(CheckURLIsPhishingMsg);
  router.registerMessage(URLTempAllowMsg);
  router.registerMessage(CheckBadTwitterIdMsg);

  router.addHandler(ROUTE, getHandler(service));
}
