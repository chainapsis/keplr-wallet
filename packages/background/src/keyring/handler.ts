import { Env, Handler, InternalHandler, Message } from "@keplr/router";
import {
  EnableKeyRingMsg,
  CreateMnemonicKeyMsg,
  CreatePrivateKeyMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  RequestSignAminoMsg,
  RequestSignDirectMsg,
  LockKeyRingMsg,
  DeleteKeyRingMsg,
  ShowKeyRingMsg,
  GetKeyRingTypeMsg,
  AddMnemonicKeyMsg,
  AddPrivateKeyMsg,
  GetMultiKeyStoreInfoMsg,
  ChangeKeyRingMsg,
  AddLedgerKeyMsg,
  CreateLedgerKeyMsg,
  SetKeyStoreCoinTypeMsg,
  RestoreKeyRingMsg,
  GetIsKeyStoreCoinTypeSetMsg,
} from "./messages";
import { KeyRingService } from "./service";
import { Bech32Address } from "@keplr/cosmos";

import { Buffer } from "buffer/";
import { cosmos } from "@keplr/cosmos";

export const getHandler: (service: KeyRingService) => Handler = (
  service: KeyRingService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case RestoreKeyRingMsg:
        return handleRestoreKeyRingMsg(service)(env, msg as RestoreKeyRingMsg);
      case EnableKeyRingMsg:
        return handleEnableKeyRingMsg(service)(env, msg as EnableKeyRingMsg);
      case DeleteKeyRingMsg:
        return handleDeleteKeyRingMsg(service)(env, msg as DeleteKeyRingMsg);
      case ShowKeyRingMsg:
        return handleShowKeyRingMsg(service)(env, msg as ShowKeyRingMsg);
      case CreateMnemonicKeyMsg:
        return handleCreateMnemonicKeyMsg(service)(
          env,
          msg as CreateMnemonicKeyMsg
        );
      case AddMnemonicKeyMsg:
        return handleAddMnemonicKeyMsg(service)(env, msg as AddMnemonicKeyMsg);
      case CreatePrivateKeyMsg:
        return handleCreatePrivateKeyMsg(service)(
          env,
          msg as CreatePrivateKeyMsg
        );
      case AddPrivateKeyMsg:
        return handleAddPrivateKeyMsg(service)(env, msg as AddPrivateKeyMsg);
      case CreateLedgerKeyMsg:
        return handleCreateLedgerKeyMsg(service)(
          env,
          msg as CreateLedgerKeyMsg
        );
      case AddLedgerKeyMsg:
        return handleAddLedgerKeyMsg(service)(env, msg as AddLedgerKeyMsg);
      case LockKeyRingMsg:
        return handleLockKeyRingMsg(service)(env, msg as LockKeyRingMsg);
      case UnlockKeyRingMsg:
        return handleUnlockKeyRingMsg(service)(env, msg as UnlockKeyRingMsg);
      case GetKeyMsg:
        return handleGetKeyMsg(service)(env, msg as GetKeyMsg);
      case RequestSignAminoMsg:
        return handleRequestSignAminoMsg(service)(
          env,
          msg as RequestSignAminoMsg
        );
      case RequestSignDirectMsg:
        return handleRequestSignDirectMsg(service)(
          env,
          msg as RequestSignDirectMsg
        );
      case GetKeyRingTypeMsg:
        return handleGetKeyRingTypeMsg(service)(env, msg as GetKeyRingTypeMsg);
      case GetMultiKeyStoreInfoMsg:
        return handleGetMultiKeyStoreInfoMsg(service)(
          env,
          msg as GetMultiKeyStoreInfoMsg
        );
      case ChangeKeyRingMsg:
        return handleChangeKeyRingMsg(service)(env, msg as ChangeKeyRingMsg);
      case GetIsKeyStoreCoinTypeSetMsg:
        return handleGetIsKeyStoreCoinTypeSetMsg(service)(
          env,
          msg as GetIsKeyStoreCoinTypeSetMsg
        );
      case SetKeyStoreCoinTypeMsg:
        return handleSetKeyStoreCoinTypeMsg(service)(
          env,
          msg as SetKeyStoreCoinTypeMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleRestoreKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<RestoreKeyRingMsg> = (service) => {
  return async (_env, _msg) => {
    return await service.restore();
  };
};

const handleEnableKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<EnableKeyRingMsg> = (service) => {
  return async (env, msg) => {
    // Will throw an error if chain is unknown.
    await service.chainsService.getChainInfo(msg.chainId);

    // This method itself tries to unlock the keyring.
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return {
      status: service.keyRingStatus,
    };
  };
};

const handleDeleteKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<DeleteKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.deleteKeyRing(msg.index, msg.password);
  };
};

const handleShowKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<ShowKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.showKeyRing(msg.index, msg.password);
  };
};

const handleCreateMnemonicKeyMsg: (
  service: KeyRingService
) => InternalHandler<CreateMnemonicKeyMsg> = (service) => {
  return async (_, msg) => {
    return {
      status: await service.createMnemonicKey(
        msg.mnemonic,
        msg.password,
        msg.meta,
        msg.bip44HDPath
      ),
    };
  };
};

const handleAddMnemonicKeyMsg: (
  service: KeyRingService
) => InternalHandler<AddMnemonicKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.addMnemonicKey(
      msg.mnemonic,
      msg.meta,
      msg.bip44HDPath
    );
  };
};

const handleCreatePrivateKeyMsg: (
  service: KeyRingService
) => InternalHandler<CreatePrivateKeyMsg> = (service) => {
  return async (_, msg) => {
    return {
      status: await service.createPrivateKey(
        Buffer.from(msg.privateKeyHex, "hex"),
        msg.password,
        msg.meta
      ),
    };
  };
};

const handleAddPrivateKeyMsg: (
  service: KeyRingService
) => InternalHandler<AddPrivateKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.addPrivateKey(
      Buffer.from(msg.privateKeyHex, "hex"),
      msg.meta
    );
  };
};

const handleCreateLedgerKeyMsg: (
  service: KeyRingService
) => InternalHandler<CreateLedgerKeyMsg> = (service) => {
  return async (env, msg) => {
    return {
      status: await service.createLedgerKey(
        env,
        msg.password,
        msg.meta,
        msg.bip44HDPath
      ),
    };
  };
};

const handleAddLedgerKeyMsg: (
  service: KeyRingService
) => InternalHandler<AddLedgerKeyMsg> = (service) => {
  return async (env, msg) => {
    return await service.addLedgerKey(env, msg.meta, msg.bip44HDPath);
  };
};

const handleLockKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<LockKeyRingMsg> = (service) => {
  return () => {
    return {
      status: service.lock(),
    };
  };
};

const handleUnlockKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<UnlockKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return {
      status: await service.unlock(msg.password),
    };
  };
};

const handleGetKeyMsg: (
  service: KeyRingService
) => InternalHandler<GetKeyMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    const key = await service.getKey(msg.chainId);

    return {
      name: service.getKeyStoreMeta("name"),
      algo: "secp256k1",
      pubKeyHex: Buffer.from(key.pubKey).toString("hex"),
      addressHex: Buffer.from(key.address).toString("hex"),
      bech32Address: new Bech32Address(key.address).toBech32(
        (await service.chainsService.getChainInfo(msg.chainId)).bech32Config
          .bech32PrefixAccAddr
      ),
    };
  };
};

const handleRequestSignAminoMsg: (
  service: KeyRingService
) => InternalHandler<RequestSignAminoMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    await service.checkBech32Address(msg.chainId, msg.bech32Address);

    return await service.requestSignAmino(env, msg.chainId, msg.signDoc);
  };
};

const handleRequestSignDirectMsg: (
  service: KeyRingService
) => InternalHandler<RequestSignDirectMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    await service.checkBech32Address(msg.chainId, msg.bech32Address);

    const signDoc = cosmos.tx.v1beta1.SignDoc.decode(msg.signDocBytes);

    const response = await service.requestSignDirect(env, msg.chainId, signDoc);

    return {
      signedBytes: cosmos.tx.v1beta1.SignDoc.encode(response.signed).finish(),
      signature: response.signature,
    };
  };
};

const handleGetKeyRingTypeMsg: (
  service: KeyRingService
) => InternalHandler<GetKeyRingTypeMsg> = (service) => {
  return () => {
    return service.getKeyRingType();
  };
};

const handleGetMultiKeyStoreInfoMsg: (
  service: KeyRingService
) => InternalHandler<GetMultiKeyStoreInfoMsg> = (service) => {
  return () => {
    return service.getMultiKeyStoreInfo();
  };
};

const handleChangeKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<ChangeKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.changeKeyStoreFromMultiKeyStore(msg.index);
  };
};

const handleGetIsKeyStoreCoinTypeSetMsg: (
  service: KeyRingService
) => InternalHandler<GetIsKeyStoreCoinTypeSetMsg> = (service) => {
  return (_, msg) => {
    return service.getKeyStoreBIP44Selectables(msg.chainId, msg.paths);
  };
};

const handleSetKeyStoreCoinTypeMsg: (
  service: KeyRingService
) => InternalHandler<SetKeyStoreCoinTypeMsg> = (service) => {
  return async (_, msg) => {
    await service.setKeyStoreCoinType(msg.chainId, msg.coinType);
    return service.keyRingStatus;
  };
};
