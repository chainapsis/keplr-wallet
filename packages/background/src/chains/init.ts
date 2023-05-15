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
import { PermissionService } from "../permission";
import { PermissionInteractiveService } from "../permission-interactive";

export function init(
  router: Router,
  chainService: ChainsService,
  permissionService: PermissionService,
  permissionInteractiveService: PermissionInteractiveService
): void {
  router.registerMessage(GetChainInfosWithCoreTypesMsg);
  router.registerMessage(GetChainInfosWithoutEndpointsMsg);
  router.registerMessage(SuggestChainInfoMsg);
  router.registerMessage(RemoveSuggestedChainInfoMsg);

  router.addHandler(
    ROUTE,
    getHandler(chainService, permissionService, permissionInteractiveService)
  );
}
