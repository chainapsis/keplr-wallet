import { Router } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { DirectTxExecutorService } from "./service";
import {
  RecordAndExecuteDirectTxsMsg,
  GetDirectTxsExecutionDataMsg,
  ExecuteDirectTxMsg,
  CancelDirectTxsExecutionMsg,
  GetDirectTxsExecutionResultMsg,
} from "./messages";

export function init(router: Router, service: DirectTxExecutorService): void {
  router.registerMessage(RecordAndExecuteDirectTxsMsg);
  router.registerMessage(ExecuteDirectTxMsg);
  router.registerMessage(GetDirectTxsExecutionDataMsg);
  router.registerMessage(GetDirectTxsExecutionResultMsg);
  router.registerMessage(CancelDirectTxsExecutionMsg);

  router.addHandler(ROUTE, getHandler(service));
}
