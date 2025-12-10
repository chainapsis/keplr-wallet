import { Router } from "@keplr-wallet/router";
import {
  DismissNewTokenFoundInMainMsg,
  GetIsShowNewTokenFoundInMainMsg,
  GetTokenScansMsg,
  RevalidateTokenScansMsg,
  SyncTokenScanInfosMsg,
  UpdateIsShowNewTokenFoundInMainMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { TokenScanService } from "./service";

export function init(router: Router, service: TokenScanService): void {
  router.registerMessage(GetTokenScansMsg);
  router.registerMessage(RevalidateTokenScansMsg);
  router.registerMessage(SyncTokenScanInfosMsg);
  router.registerMessage(GetIsShowNewTokenFoundInMainMsg);
  router.registerMessage(UpdateIsShowNewTokenFoundInMainMsg);
  router.registerMessage(DismissNewTokenFoundInMainMsg);

  router.addHandler(ROUTE, getHandler(service));
}
