import { Router } from "@keplr-wallet/router";
import {
  ChangeChainMsg,
  GetChainInfosMsg,
  SuggestChainInfoMsg,
  RemoveSuggestedChainInfoMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ChainsService } from "./service";

export function init(router: Router, service: ChainsService): void {
  router.registerMessage(GetChainInfosMsg);
  router.registerMessage(SuggestChainInfoMsg);
  router.registerMessage(RemoveSuggestedChainInfoMsg);
  router.registerMessage(ChangeChainMsg);

  router.addHandler(ROUTE, getHandler(service));
}
