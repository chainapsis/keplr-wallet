import { Router } from "@keplr-wallet/router";
import { SendTxEthereumMsg, SendTxEthereumMsgAndRecordMsg } from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxEthereumService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";
import { RecentSendHistoryService } from "../recent-send-history";

export function init(
  router: Router,
  service: BackgroundTxEthereumService,
  permissionInteractionService: PermissionInteractiveService,
  recentSendHistoryService: RecentSendHistoryService
): void {
  router.registerMessage(SendTxEthereumMsg);
  router.registerMessage(SendTxEthereumMsgAndRecordMsg);

  router.addHandler(
    ROUTE,
    getHandler(service, permissionInteractionService, recentSendHistoryService)
  );
}
