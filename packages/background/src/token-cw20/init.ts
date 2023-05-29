import { Router } from "@keplr-wallet/router";
import {
  GetAllTokenInfosMsg,
  AddTokenMsg,
  RemoveTokenMsg,
  GetSecret20ViewingKey,
  SuggestTokenMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { TokenCW20Service } from "./service";
import { KeyRingCosmosService } from "../keyring-cosmos";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: TokenCW20Service,
  permissionInteractionService: PermissionInteractiveService,
  keyRingCosmosService: KeyRingCosmosService
): void {
  router.registerMessage(GetAllTokenInfosMsg);
  router.registerMessage(SuggestTokenMsg);
  router.registerMessage(AddTokenMsg);
  router.registerMessage(RemoveTokenMsg);
  router.registerMessage(GetSecret20ViewingKey);

  router.addHandler(
    ROUTE,
    getHandler(service, permissionInteractionService, keyRingCosmosService)
  );
}
