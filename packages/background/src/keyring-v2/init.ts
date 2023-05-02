import { Router } from "@keplr-wallet/router";
import { KeyRingService } from "./service";
import {
  GetKeyRingStatusMsg,
  FinalizeMnemonicKeyCoinTypeMsg,
  NewMnemonicKeyMsg,
  NewLedgerKeyMsg,
  AppendLedgerKeyAppMsg,
  LockKeyRingMsg,
  UnlockKeyRingMsg,
  SelectKeyRingMsg,
  ChangeKeyRingNameMsg,
  DeleteKeyRingMsg,
  ShowSensitiveKeyRingDataMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(GetKeyRingStatusMsg);
  router.registerMessage(SelectKeyRingMsg);
  router.registerMessage(FinalizeMnemonicKeyCoinTypeMsg);
  router.registerMessage(NewMnemonicKeyMsg);
  router.registerMessage(NewLedgerKeyMsg);
  router.registerMessage(AppendLedgerKeyAppMsg);
  router.registerMessage(LockKeyRingMsg);
  router.registerMessage(UnlockKeyRingMsg);
  router.registerMessage(ChangeKeyRingNameMsg);
  router.registerMessage(DeleteKeyRingMsg);
  router.registerMessage(ShowSensitiveKeyRingDataMsg);

  router.addHandler(ROUTE, getHandler(service));
}
