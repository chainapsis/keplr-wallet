import { Router } from "@keplr-wallet/router";
import { ManageViewAssetTokenService } from "./service";
import { ROUTE } from "./constants";
import {
  DisableViewAssetTokenMsg,
  EnableViewAssetTokenMsg,
  GetAllDisabledViewAssetTokenMsg,
  GetDisabledViewAssetTokenListMsg,
} from "./messages";
import { getHandler } from "./handler";

export function init(
  router: Router,
  service: ManageViewAssetTokenService
): void {
  router.registerMessage(GetAllDisabledViewAssetTokenMsg);
  router.registerMessage(GetDisabledViewAssetTokenListMsg);
  router.registerMessage(DisableViewAssetTokenMsg);
  router.registerMessage(EnableViewAssetTokenMsg);

  router.addHandler(ROUTE, getHandler(service));
}
