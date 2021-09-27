import { Router } from "@keplr-wallet/router";
import {
  CreateMnemonicKeyMsg,
  CreatePrivateKeyMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  RequestSignAminoMsg,
  RequestSignDirectMsg,
  LockKeyRingMsg,
  DeleteKeyRingMsg,
  UpdateNameKeyRingMsg,
  ShowKeyRingMsg,
  AddMnemonicKeyMsg,
  AddPrivateKeyMsg,
  GetMultiKeyStoreInfoMsg,
  ChangeKeyRingMsg,
  CreateLedgerKeyMsg,
  AddLedgerKeyMsg,
  GetIsKeyStoreCoinTypeSetMsg,
  SetKeyStoreCoinTypeMsg,
  RestoreKeyRingMsg,
  CheckPasswordMsg,
  ExportKeyRingDatasMsg,
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingService } from "./service";

export function init(router: Router, service: KeyRingService): void {
  router.registerMessage(RestoreKeyRingMsg);
  router.registerMessage(DeleteKeyRingMsg);
  router.registerMessage(UpdateNameKeyRingMsg);
  router.registerMessage(ShowKeyRingMsg);
  router.registerMessage(CreateMnemonicKeyMsg);
  router.registerMessage(AddMnemonicKeyMsg);
  router.registerMessage(CreatePrivateKeyMsg);
  router.registerMessage(AddPrivateKeyMsg);
  router.registerMessage(CreateLedgerKeyMsg);
  router.registerMessage(AddLedgerKeyMsg);
  router.registerMessage(LockKeyRingMsg);
  router.registerMessage(UnlockKeyRingMsg);
  router.registerMessage(GetKeyMsg);
  router.registerMessage(RequestSignAminoMsg);
  router.registerMessage(RequestSignDirectMsg);
  router.registerMessage(GetMultiKeyStoreInfoMsg);
  router.registerMessage(ChangeKeyRingMsg);
  router.registerMessage(GetIsKeyStoreCoinTypeSetMsg);
  router.registerMessage(SetKeyStoreCoinTypeMsg);
  router.registerMessage(CheckPasswordMsg);
  router.registerMessage(ExportKeyRingDatasMsg);

  router.addHandler(ROUTE, getHandler(service));
}
