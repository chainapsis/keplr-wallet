import { Router } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { InteractionAddonService } from "./service";
import { getHandler } from "./handler";
import { ReplacePageMsg } from "./messages";

export function init(router: Router, service: InteractionAddonService): void {
  router.registerMessage(ReplacePageMsg);

  router.addHandler(ROUTE, getHandler(service));
}
