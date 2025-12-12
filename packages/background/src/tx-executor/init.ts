import { Router } from "@keplr-wallet/router";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { BackgroundTxExecutorService } from "./service";
import {
  RecordAndExecuteTxsMsg,
  ResumeTxMsg,
  GetTxExecutionMsg,
} from "./messages";

export function init(
  router: Router,
  service: BackgroundTxExecutorService
): void {
  router.registerMessage(RecordAndExecuteTxsMsg);
  router.registerMessage(ResumeTxMsg);
  router.registerMessage(GetTxExecutionMsg);

  router.addHandler(ROUTE, getHandler(service));
}
