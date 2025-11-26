import { Router } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxExecutorService } from "./service";
import {
  RecordAndExecuteDirectTxsMsg,
  ResumeDirectTxsMsg,
  CancelDirectTxsMsg,
  GetDirectTxsBatchMsg,
  GetDirectTxsBatchResultMsg,
} from "./messages";

export function init(
  router: Router,
  service: BackgroundTxExecutorService
): void {
  router.registerMessage(RecordAndExecuteDirectTxsMsg);
  router.registerMessage(ResumeDirectTxsMsg);
  router.registerMessage(GetDirectTxsBatchMsg);
  router.registerMessage(GetDirectTxsBatchResultMsg);
  router.registerMessage(CancelDirectTxsMsg);

  router.addHandler(ROUTE, getHandler(service));
}
