import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  GetKeyRingStatusMsg,
  LockKeyRingMsg,
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
      case NewMnemonicKeyMsg:
        return handleNewMnemonicKeyMsg(service)(env, msg as NewMnemonicKeyMsg);
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
