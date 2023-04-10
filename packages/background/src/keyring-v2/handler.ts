import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  FinalizeMnemonicKeyCoinTypeMsg,
  GetKeyRingStatusMsg,
  LockKeyRingMsg,
  NewLedgerKeyMsg,
  NewMnemonicKeyMsg,
  UnlockKeyRingMsg,
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
    await service.createMnemonicKeyRing(
      env,
      msg.mnemonic,
      msg.bip44HDPath,
      msg.name,
      msg.password
    );
    return {
      status: service.keyRingStatus,
      keyInfos: service.getKeyInfos(),
    };
  };
};

const handleNewLedgerKeyMsg: (
  service: KeyRingService
) => InternalHandler<NewLedgerKeyMsg> = (service) => {
  return async (env, msg) => {
    await service.createLedgerKeyRing(
      env,
      msg.pubKey,
      msg.app,
      msg.bip44HDPath,
      msg.name,
      msg.password
    );
    return {
      status: service.keyRingStatus,
      keyInfos: service.getKeyInfos(),
    };
  };
};
