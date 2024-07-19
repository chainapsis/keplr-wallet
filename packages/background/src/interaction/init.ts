import { Router } from "@keplr-wallet/router";
import {
  GetInteractionWaitingDataArrayMsg,
  ApproveInteractionMsg,
  RejectInteractionMsg,
  ApproveInteractionV2Msg,
  RejectInteractionV2Msg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { InteractionService } from "./service";

export function init(router: Router, service: InteractionService): void {
  router.registerMessage(GetInteractionWaitingDataArrayMsg);
  router.registerMessage(ApproveInteractionMsg);
  router.registerMessage(RejectInteractionMsg);
  router.registerMessage(ApproveInteractionV2Msg);
  router.registerMessage(RejectInteractionV2Msg);

  router.addHandler(ROUTE, getHandler(service));
}
