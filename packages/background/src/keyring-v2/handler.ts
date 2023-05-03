import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  ChangeKeyRingNameMsg,
  DeleteKeyRingMsg,
  FinalizeMnemonicKeyCoinTypeMsg,
  GetKeyRingStatusMsg,
  LockKeyRingMsg,
  NewLedgerKeyMsg,
  AppendLedgerKeyAppMsg,
  NewMnemonicKeyMsg,
  SelectKeyRingMsg,
  ShowSensitiveKeyRingDataMsg,
  UnlockKeyRingMsg,
  ChangeUserPasswordMsg,
} from "./messages";
import { KeyRingService } from "./service";

export const getHandler: (service: KeyRingService) => Handler = (
  service: KeyRingService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetKeyRingStatusMsg:
        return handleGetKeyRingStatusMsg(service)(
          env,
          msg as GetKeyRingStatusMsg
        );
      case SelectKeyRingMsg:
        return handleSelectKeyRingMsg(service)(env, msg as SelectKeyRingMsg);
      case LockKeyRingMsg:
        return handleLockKeyRingMsg(service)(env, msg as LockKeyRingMsg);
      case UnlockKeyRingMsg:
        return handleUnlockKeyRingMsg(service)(env, msg as UnlockKeyRingMsg);
      case FinalizeMnemonicKeyCoinTypeMsg:
        return handleFinalizeMnemonicKeyCoinTypeMsg(service)(
          env,
          msg as FinalizeMnemonicKeyCoinTypeMsg
        );
      case NewMnemonicKeyMsg:
        return handleNewMnemonicKeyMsg(service)(env, msg as NewMnemonicKeyMsg);
      case NewLedgerKeyMsg:
        return handleNewLedgerKeyMsg(service)(env, msg as NewLedgerKeyMsg);
      case AppendLedgerKeyAppMsg:
        return handleAppendLedgerKeyAppMsg(service)(
          env,
          msg as AppendLedgerKeyAppMsg
        );
      case ChangeKeyRingNameMsg:
        return handleChangeKeyRingNameMsg(service)(
          env,
          msg as ChangeKeyRingNameMsg
        );
      case DeleteKeyRingMsg:
        return handleDeleteKeyRingMsg(service)(env, msg as DeleteKeyRingMsg);
      case ShowSensitiveKeyRingDataMsg:
        return handleShowSensitiveKeyRingDataMsg(service)(
          env,
          msg as ShowSensitiveKeyRingDataMsg
        );
      case ChangeUserPasswordMsg:
        return handleChangeUserPasswordMsg(service)(
          env,
          msg as ChangeUserPasswordMsg
        );
      default:
        throw new KeplrError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleGetKeyRingStatusMsg: (
  service: KeyRingService
) => InternalHandler<GetKeyRingStatusMsg> = (service) => {
  return () => {
    return {
      status: service.keyRingStatus,
      keyInfos: service.getKeyInfos(),
    };
  };
};

const handleSelectKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<SelectKeyRingMsg> = (service) => {
  return (_, msg) => {
    service.selectKeyRing(msg.vaultId);
    return {
      status: service.keyRingStatus,
      keyInfos: service.getKeyInfos(),
    };
  };
};

const handleLockKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<LockKeyRingMsg> = (service) => {
  return () => {
    service.lockKeyRing();
    return {
      status: service.keyRingStatus,
    };
  };
};

const handleUnlockKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<UnlockKeyRingMsg> = (service) => {
  return async (_env, msg) => {
    await service.unlockKeyRing(msg.password);
    return {
      status: service.keyRingStatus,
    };
  };
};

const handleFinalizeMnemonicKeyCoinTypeMsg: (
  service: KeyRingService
) => InternalHandler<FinalizeMnemonicKeyCoinTypeMsg> = (service) => {
  return (_, msg) => {
    service.finalizeMnemonicKeyCoinType(msg.id, msg.chainId, msg.coinType);
    return {
      status: service.keyRingStatus,
      keyInfos: service.getKeyInfos(),
    };
  };
};

const handleNewMnemonicKeyMsg: (
  service: KeyRingService
) => InternalHandler<NewMnemonicKeyMsg> = (service) => {
  return async (env, msg) => {
    const vaultId = await service.createMnemonicKeyRing(
      env,
      msg.mnemonic,
      msg.bip44HDPath,
      msg.name,
      msg.password
    );
    return {
      vaultId,
      status: service.keyRingStatus,
      keyInfos: service.getKeyInfos(),
    };
  };
};

const handleNewLedgerKeyMsg: (
  service: KeyRingService
) => InternalHandler<NewLedgerKeyMsg> = (service) => {
  return async (env, msg) => {
    const vaultId = await service.createLedgerKeyRing(
      env,
      msg.pubKey,
      msg.app,
      msg.bip44HDPath,
      msg.name,
      msg.password
    );
    return {
      vaultId,
      status: service.keyRingStatus,
      keyInfos: service.getKeyInfos(),
    };
  };
};

const handleAppendLedgerKeyAppMsg: (
  service: KeyRingService
) => InternalHandler<AppendLedgerKeyAppMsg> = (service) => {
  return (_, msg) => {
    service.appendLedgerKeyRing(msg.vaultId, msg.pubKey, msg.app);
    return {
      status: service.keyRingStatus,
      keyInfos: service.getKeyInfos(),
    };
  };
};

const handleChangeKeyRingNameMsg: (
  service: KeyRingService
) => InternalHandler<ChangeKeyRingNameMsg> = (service) => {
  return (_env, msg) => {
    service.changeKeyRingName(msg.vaultId, msg.name);
    return {
      status: service.keyRingStatus,
      keyInfos: service.getKeyInfos(),
    };
  };
};

const handleDeleteKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<DeleteKeyRingMsg> = (service) => {
  return async (_env, msg) => {
    const wasSelected = await service.deleteKeyRing(msg.vaultId, msg.password);
    return {
      wasSelected,
      status: service.keyRingStatus,
      keyInfos: service.getKeyInfos(),
    };
  };
};

const handleShowSensitiveKeyRingDataMsg: (
  service: KeyRingService
) => InternalHandler<ShowSensitiveKeyRingDataMsg> = (service) => {
  return async (_env, msg) => {
    return await service.showSensitiveKeyRingData(msg.vaultId, msg.password);
  };
};

const handleChangeUserPasswordMsg: (
  service: KeyRingService
) => InternalHandler<ChangeUserPasswordMsg> = (service) => {
  return async (_env, msg) => {
    return await service.changeUserPassword(
      msg.prevUserPassword,
      msg.newUserPassword
    );
  };
};
