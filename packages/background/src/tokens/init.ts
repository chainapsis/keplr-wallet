import { Router } from "@keplr-wallet/router";
import {
  GetTokensMsg,
  AddTokenMsg,
  RemoveTokenMsg,
  GetSecret20ViewingKey,
  SuggestTokenMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { TokensService } from "./service";

export function init(router: Router, service: TokensService): void {
  router.registerMessage(GetTokensMsg);
  router.registerMessage(SuggestTokenMsg);
  router.registerMessage(AddTokenMsg);
  router.registerMessage(RemoveTokenMsg);
  router.registerMessage(GetSecret20ViewingKey);

  router.addHandler(ROUTE, getHandler(service));
}
