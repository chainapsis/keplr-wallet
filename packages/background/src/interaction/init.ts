import { Router } from "@keplr-wallet/router";
import { ApproveInteractionMsg, RejectInteractionMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { InteractionService } from "./service";

export function init(router: Router, service: InteractionService): void {
  router.registerMessage(ApproveInteractionMsg);
  router.registerMessage(RejectInteractionMsg);

  router.addHandler(ROUTE, getHandler(service));
}
