import { Router } from "@keplr-wallet/router";
import {
  GetRecentSendHistoriesMsg,
  SendTxAndRecordMsg,
  SendTxAndRecordWithIBCPacketForwardingMsg,
  GetIBCTransferHistories,
  RemoveIBCTransferHistory,
  ClearAllIBCTransferHistory,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { RecentSendHistoryService } from "./service";

export function init(router: Router, service: RecentSendHistoryService): void {
  router.registerMessage(GetRecentSendHistoriesMsg);
  router.registerMessage(SendTxAndRecordMsg);
  router.registerMessage(SendTxAndRecordWithIBCPacketForwardingMsg);
  router.registerMessage(GetIBCTransferHistories);
  router.registerMessage(RemoveIBCTransferHistory);
  router.registerMessage(ClearAllIBCTransferHistory);

  router.addHandler(ROUTE, getHandler(service));
}
