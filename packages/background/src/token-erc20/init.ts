import { Router } from "@keplr-wallet/router";
import {
  GetAllERC20TokenInfosMsg,
  AddERC20TokenMsg,
  RemoveERC20TokenMsg,
  SuggestERC20TokenMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { TokenERC20Service } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  service: TokenERC20Service,
  permissionInteractionService: PermissionInteractiveService
): void {
  router.registerMessage(GetAllERC20TokenInfosMsg);
  router.registerMessage(SuggestERC20TokenMsg);
  router.registerMessage(AddERC20TokenMsg);
  router.registerMessage(RemoveERC20TokenMsg);

  router.addHandler(ROUTE, getHandler(service, permissionInteractionService));
}
