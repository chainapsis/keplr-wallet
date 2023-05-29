import { Router } from "@keplr-wallet/router";
import { GetRecentSendHistoriesMsg, SendTxAndRecordMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { RecentSendHistoryService } from "./service";

export function init(router: Router, service: RecentSendHistoryService): void {
  router.registerMessage(GetRecentSendHistoriesMsg);
  router.registerMessage(SendTxAndRecordMsg);

  router.addHandler(ROUTE, getHandler(service));
}
