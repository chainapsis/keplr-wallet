import { Router } from "@keplr-wallet/router";
import {
  GetRecentSendHistoriesMsg,
  SendTxAndRecordMsg,
  SendTxAndRecordWithIBCPacketForwardingMsg,
  SendTxAndRecordWithIBCSwapMsg,
  GetIBCHistoriesMsg,
  RemoveIBCHistoryMsg,
  ClearAllIBCHistoryMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { RecentSendHistoryService } from "./service";

export function init(router: Router, service: RecentSendHistoryService): void {
  router.registerMessage(GetRecentSendHistoriesMsg);
  router.registerMessage(SendTxAndRecordMsg);
  router.registerMessage(SendTxAndRecordWithIBCPacketForwardingMsg);
  router.registerMessage(SendTxAndRecordWithIBCSwapMsg);
  router.registerMessage(GetIBCHistoriesMsg);
  router.registerMessage(RemoveIBCHistoryMsg);
  router.registerMessage(ClearAllIBCHistoryMsg);

  router.addHandler(ROUTE, getHandler(service));
}
