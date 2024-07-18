import { Router } from "@keplr-wallet/router";
import { SidePanelService } from "./service";
import { GetSidePanelEnabledMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(router: Router, service: SidePanelService): void {
  router.registerMessage(GetSidePanelEnabledMsg);

  router.addHandler(ROUTE, getHandler(service));
}
