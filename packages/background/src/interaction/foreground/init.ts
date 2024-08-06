import { Router } from "@keplr-wallet/router";
import {
  PushInteractionDataMsg,
  PushEventDataMsg,
  InteractionPingMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { InteractionForegroundService } from "./service";

export function interactionForegroundInit(
  router: Router,
  service: InteractionForegroundService
): void {
  router.registerMessage(PushInteractionDataMsg);
  router.registerMessage(PushEventDataMsg);
  router.registerMessage(InteractionPingMsg);

  router.addHandler(ROUTE, getHandler(service));
}
