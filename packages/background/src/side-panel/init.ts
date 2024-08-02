import { Router } from "@keplr-wallet/router";
import { SidePanelService } from "./service";
import {
  GetSidePanelIsSupportedMsg,
  GetSidePanelEnabledMsg,
  SetSidePanelEnabledMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(router: Router, service: SidePanelService): void {
  router.registerMessage(GetSidePanelIsSupportedMsg);
  router.registerMessage(GetSidePanelEnabledMsg);
  router.registerMessage(SetSidePanelEnabledMsg);

  router.addHandler(ROUTE, getHandler(service));
}
