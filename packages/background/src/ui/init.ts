import { Router } from "@keplr-wallet/router";
import { OpenSendUIMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { UIService } from "./service";

export function init(router: Router, service: UIService): void {
  router.registerMessage(OpenSendUIMsg);

  router.addHandler(ROUTE, getHandler(service));
}
