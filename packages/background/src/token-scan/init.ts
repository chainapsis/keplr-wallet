import { Router } from "@keplr-wallet/router";
import { GetTokenScansMsg, RevalidateTokenScansMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { TokenScanService } from "./service";

export function init(router: Router, service: TokenScanService): void {
  router.registerMessage(GetTokenScansMsg);
  router.registerMessage(RevalidateTokenScansMsg);

  router.addHandler(ROUTE, getHandler(service));
}
