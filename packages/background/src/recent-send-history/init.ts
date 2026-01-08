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
  ClearAllSkipHistoryMsg,
  RecordTxWithSkipSwapMsg,
  GetSkipHistoriesMsg,
  RemoveSkipHistoryMsg,
  RecordTxWithSwapV2Msg,
  GetSwapV2HistoriesMsg,
  RemoveSwapV2HistoryMsg,
  ClearAllSwapV2HistoryMsg,
  HideSwapV2HistoryMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { RecentSendHistoryService } from "./service";

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
  router.registerMessage(RecordTxWithSwapV2Msg);
  router.registerMessage(GetSwapV2HistoriesMsg);
  router.registerMessage(RemoveSwapV2HistoryMsg);
  router.registerMessage(ClearAllSwapV2HistoryMsg);
  router.registerMessage(HideSwapV2HistoryMsg);

  router.addHandler(ROUTE, getHandler(service));
}
