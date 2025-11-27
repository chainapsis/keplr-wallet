import { Router } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxExecutorService } from "./service";
import {
  RecordAndExecuteDirectTxsMsg,
  ResumeDirectTxsMsg,
  CancelDirectTxsMsg,
  GetDirectTxBatchMsg,
} from "./messages";

export function init(
  router: Router,
  service: BackgroundTxExecutorService
): void {
  router.registerMessage(RecordAndExecuteDirectTxsMsg);
  router.registerMessage(ResumeDirectTxsMsg);
  router.registerMessage(GetDirectTxBatchMsg);
  router.registerMessage(CancelDirectTxsMsg);

  router.addHandler(ROUTE, getHandler(service));
}
