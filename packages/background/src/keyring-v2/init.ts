import { Router } from "@keplr-wallet/router";
import { KeyRingService } from "./service";
import {
  GetKeyRingStatusMsg,
  NewMnemonicKeyMsg,
  NewLedgerKeyMsg,
  LockKeyRingMsg,
  UnlockKeyRingMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(GetKeyRingStatusMsg);
  router.registerMessage(NewMnemonicKeyMsg);
  router.registerMessage(NewLedgerKeyMsg);
  router.registerMessage(LockKeyRingMsg);
  router.registerMessage(UnlockKeyRingMsg);

  router.addHandler(ROUTE, getHandler(service));
}
