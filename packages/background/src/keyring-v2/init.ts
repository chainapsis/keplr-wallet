import { Router } from "@keplr-wallet/router";
import { KeyRingService } from "./service";
import {
  GetKeyRingStatusMsg,
  FinalizeMnemonicKeyCoinTypeMsg,
  NewMnemonicKeyMsg,
  NewLedgerKeyMsg,
  LockKeyRingMsg,
  UnlockKeyRingMsg,
  SelectKeyRingMsg,
  ChangeKeyRingNameMsg,
  DeleteKeyRingMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(GetKeyRingStatusMsg);
  router.registerMessage(SelectKeyRingMsg);
  router.registerMessage(FinalizeMnemonicKeyCoinTypeMsg);
  router.registerMessage(NewMnemonicKeyMsg);
  router.registerMessage(NewLedgerKeyMsg);
  router.registerMessage(LockKeyRingMsg);
  router.registerMessage(UnlockKeyRingMsg);
  router.registerMessage(ChangeKeyRingNameMsg);
  router.registerMessage(DeleteKeyRingMsg);

  router.addHandler(ROUTE, getHandler(service));
}
