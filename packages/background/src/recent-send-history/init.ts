import { Router } from "@keplr-wallet/router";
import {
  GetRecentSendHistoriesMsg,
  AddRecentSendHistoryMsg,
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
import {
  ClearAllSkipHistoryMsg,
  GetSkipHistoriesMsg,
  RecordTxWithSkipSwapMsg,
  RemoveSkipHistoryMsg,
} from "./temp-skip-message";

export function init(router: Router, service: RecentSendHistoryService): void {
  router.registerMessage(GetRecentSendHistoriesMsg);
  router.registerMessage(AddRecentSendHistoryMsg);
  router.registerMessage(SendTxAndRecordMsg);
  router.registerMessage(SendTxAndRecordWithIBCPacketForwardingMsg);
  router.registerMessage(SendTxAndRecordWithIBCSwapMsg);
  router.registerMessage(GetIBCHistoriesMsg);
  router.registerMessage(RemoveIBCHistoryMsg);
  router.registerMessage(ClearAllIBCHistoryMsg);
  router.registerMessage(RecordTxWithSkipSwapMsg);
  router.registerMessage(GetSkipHistoriesMsg);
  router.registerMessage(RemoveSkipHistoryMsg);
  router.registerMessage(ClearAllSkipHistoryMsg);

  router.addHandler(ROUTE, getHandler(service));
}
