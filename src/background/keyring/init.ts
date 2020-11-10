import { MessageManager } from "../../common/message";
import {
  EnableKeyRingMsg,
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  CreateMnemonicKeyMsg,
  CreatePrivateKeyMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  RequestSignMsg,
  GetRequestedMessage,
  ApproveTxBuilderConfigMsg,
  RejectTxBuilderConfigMsg,
  ApproveSignMsg,
  RejectSignMsg,
  LockKeyRingMsg,
  DeleteKeyRingMsg,
  ShowKeyRingMsg,
  RequestTxBuilderConfigMsg,
  GetRequestedTxBuilderConfigMsg,
  GetKeyRingTypeMsg,
  AddMnemonicKeyMsg,
  AddPrivateKeyMsg,
  GetMultiKeyStoreInfoMsg,
  ChangeKeyRingMsg,
  CreateLedgerKeyMsg,
  AddLedgerKeyMsg,
  GetKeyStoreBIP44SelectablesMsg,
  SetKeyStoreCoinTypeMsg
} from "./messages";
import { ROUTE } from "./constants";
import { getHandler } from "./handler";
import { KeyRingKeeper } from "./keeper";

export function init(
  messageManager: MessageManager,
  keeper: KeyRingKeeper
): void {
  messageManager.registerMessage(EnableKeyRingMsg);
  messageManager.registerMessage(RestoreKeyRingMsg);
  messageManager.registerMessage(SaveKeyRingMsg);
  messageManager.registerMessage(DeleteKeyRingMsg);
  messageManager.registerMessage(ShowKeyRingMsg);
  messageManager.registerMessage(CreateMnemonicKeyMsg);
  messageManager.registerMessage(AddMnemonicKeyMsg);
  messageManager.registerMessage(CreatePrivateKeyMsg);
  messageManager.registerMessage(AddPrivateKeyMsg);
  messageManager.registerMessage(CreateLedgerKeyMsg);
  messageManager.registerMessage(AddLedgerKeyMsg);
  messageManager.registerMessage(LockKeyRingMsg);
  messageManager.registerMessage(UnlockKeyRingMsg);
  messageManager.registerMessage(GetKeyMsg);
  messageManager.registerMessage(RequestTxBuilderConfigMsg);
  messageManager.registerMessage(GetRequestedTxBuilderConfigMsg);
  messageManager.registerMessage(ApproveTxBuilderConfigMsg);
  messageManager.registerMessage(RejectTxBuilderConfigMsg);
  messageManager.registerMessage(RequestSignMsg);
  messageManager.registerMessage(GetRequestedMessage);
  messageManager.registerMessage(ApproveSignMsg);
  messageManager.registerMessage(RejectSignMsg);
  messageManager.registerMessage(GetKeyRingTypeMsg);
  messageManager.registerMessage(GetMultiKeyStoreInfoMsg);
  messageManager.registerMessage(ChangeKeyRingMsg);
  messageManager.registerMessage(GetKeyStoreBIP44SelectablesMsg);
  messageManager.registerMessage(SetKeyStoreCoinTypeMsg);

  messageManager.addHandler(ROUTE, getHandler(keeper));
}
