import { Router } from "@keplr-wallet/router";
import {
  GetChainInfosWithCoreTypesMsg,
  SuggestChainInfoMsg,
  RemoveSuggestedChainInfoMsg,
  GetChainInfosWithoutEndpointsMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { ChainsService } from "./service";

export function init(router: Router, service: ChainsService): void {
  router.registerMessage(GetChainInfosWithCoreTypesMsg);
  router.registerMessage(GetChainInfosWithoutEndpointsMsg);
  router.registerMessage(SuggestChainInfoMsg);
  router.registerMessage(RemoveSuggestedChainInfoMsg);

  router.addHandler(ROUTE, getHandler(service));
}
