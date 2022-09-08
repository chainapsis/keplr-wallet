import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
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
  AddLedgerKeyMsg,
  CreateLedgerKeyMsg,
  SetKeyStoreCoinTypeMsg,
  RestoreKeyRingMsg,
  GetIsKeyStoreCoinTypeSetMsg,
  CheckPasswordMsg,
  ExportKeyRingDatasMsg,
  RequestVerifyADR36AminoSignDoc,
} from "./messages";
import { AbstractKeyRingService } from "./service";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { SignDoc } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";

export const getHandler: (service: AbstractKeyRingService) => Handler = (
  service: AbstractKeyRingService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case RestoreKeyRingMsg:
        return handleRestoreKeyRingMsg(service)(env, msg as RestoreKeyRingMsg);
      case DeleteKeyRingMsg:
        return handleDeleteKeyRingMsg(service)(env, msg as DeleteKeyRingMsg);
      case UpdateNameKeyRingMsg:
        return handleUpdateNameKeyRingMsg(service)(
          env,
          msg as UpdateNameKeyRingMsg
        );
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
      case RequestVerifyADR36AminoSignDoc:
        return handleRequestVerifyADR36AminoSignDoc(service)(
          env,
          msg as RequestVerifyADR36AminoSignDoc
        );
      case RequestSignDirectMsg:
        return handleRequestSignDirectMsg(service)(
          env,
          msg as RequestSignDirectMsg
        );
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
      case CheckPasswordMsg:
        return handleCheckPasswordMsg(service)(env, msg as CheckPasswordMsg);
      case ExportKeyRingDatasMsg:
        return handleExportKeyRingDatasMsg(service)(
          env,
          msg as ExportKeyRingDatasMsg
        );
      default:
        throw new KeplrError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleRestoreKeyRingMsg: (
  service: AbstractKeyRingService
) => InternalHandler<RestoreKeyRingMsg> = (service) => {
  return async (_env, _msg) => {
    return await service.restore();
  };
};

const handleDeleteKeyRingMsg: (
  service: AbstractKeyRingService
) => InternalHandler<DeleteKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.deleteKeyRing(msg.index, msg.password);
  };
};

const handleUpdateNameKeyRingMsg: (
  service: AbstractKeyRingService
) => InternalHandler<UpdateNameKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.updateNameKeyRing(msg.index, msg.name);
  };
};

const handleShowKeyRingMsg: (
  service: AbstractKeyRingService
) => InternalHandler<ShowKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.showKeyRing(msg.index, msg.password);
  };
};

const handleCreateMnemonicKeyMsg: (
  service: AbstractKeyRingService
) => InternalHandler<CreateMnemonicKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.createMnemonicKey(
      msg.kdf,
      msg.mnemonic,
      msg.password,
      msg.meta,
      msg.bip44HDPath
    );
  };
};

const handleAddMnemonicKeyMsg: (
  service: AbstractKeyRingService
) => InternalHandler<AddMnemonicKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.addMnemonicKey(
      msg.kdf,
      msg.mnemonic,
      msg.meta,
      msg.bip44HDPath
    );
  };
};

const handleCreatePrivateKeyMsg: (
  service: AbstractKeyRingService
) => InternalHandler<CreatePrivateKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.createPrivateKey(
      msg.kdf,
      msg.privateKey,
      msg.password,
      msg.meta
    );
  };
};

const handleAddPrivateKeyMsg: (
  service: AbstractKeyRingService
) => InternalHandler<AddPrivateKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.addPrivateKey(msg.kdf, msg.privateKey, msg.meta);
  };
};

const handleCreateLedgerKeyMsg: (
  service: AbstractKeyRingService
) => InternalHandler<CreateLedgerKeyMsg> = (service) => {
  return async (env, msg) => {
    return await service.createLedgerKey(
      env,
      msg.kdf,
      msg.password,
      msg.meta,
      msg.bip44HDPath
    );
  };
};

const handleAddLedgerKeyMsg: (
  service: AbstractKeyRingService
) => InternalHandler<AddLedgerKeyMsg> = (service) => {
  return async (env, msg) => {
    return await service.addLedgerKey(env, msg.kdf, msg.meta, msg.bip44HDPath);
  };
};

const handleLockKeyRingMsg: (
  service: AbstractKeyRingService
) => InternalHandler<LockKeyRingMsg> = (service) => {
  return () => {
    return {
      status: service.lock(),
    };
  };
};

const handleUnlockKeyRingMsg: (
  service: AbstractKeyRingService
) => InternalHandler<UnlockKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return {
      status: await service.unlock(msg.password),
    };
  };
};

const handleGetKeyMsg: (
  service: AbstractKeyRingService
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
      pubKey: key.pubKey,
      address: key.address,
      bech32Address: new Bech32Address(key.address).toBech32(
        (await service.chainsService.getChainInfo(msg.chainId)).bech32Config
          .bech32PrefixAccAddr
      ),
      isNanoLedger: key.isNanoLedger,
    };
  };
};

const handleRequestSignAminoMsg: (
  service: AbstractKeyRingService
) => InternalHandler<RequestSignAminoMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.requestSignAmino(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.signDoc,
      msg.signOptions
    );
  };
};

const handleRequestVerifyADR36AminoSignDoc: (
  service: AbstractKeyRingService
) => InternalHandler<RequestVerifyADR36AminoSignDoc> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.verifyADR36AminoSignDoc(
      msg.chainId,
      msg.signer,
      msg.data,
      msg.signature
    );
  };
};

const handleRequestSignDirectMsg: (
  service: AbstractKeyRingService
) => InternalHandler<RequestSignDirectMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    const signDoc = SignDoc.fromPartial({
      bodyBytes: msg.signDoc.bodyBytes,
      authInfoBytes: msg.signDoc.authInfoBytes,
      chainId: msg.signDoc.chainId,
      accountNumber: msg.signDoc.accountNumber,
    });

    const response = await service.requestSignDirect(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      signDoc,
      msg.signOptions
    );

    return {
      signed: {
        bodyBytes: response.signed.bodyBytes,
        authInfoBytes: response.signed.authInfoBytes,
        chainId: response.signed.chainId,
        accountNumber: response.signed.accountNumber.toString(),
      },
      signature: response.signature,
    };
  };
};

const handleGetMultiKeyStoreInfoMsg: (
  service: AbstractKeyRingService
) => InternalHandler<GetMultiKeyStoreInfoMsg> = (service) => {
  return () => {
    return {
      multiKeyStoreInfo: service.getMultiKeyStoreInfo(),
    };
  };
};

const handleChangeKeyRingMsg: (
  service: AbstractKeyRingService
) => InternalHandler<ChangeKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.changeKeyStoreFromMultiKeyStore(msg.index);
  };
};

const handleGetIsKeyStoreCoinTypeSetMsg: (
  service: AbstractKeyRingService
) => InternalHandler<GetIsKeyStoreCoinTypeSetMsg> = (service) => {
  return (_, msg) => {
    return service.getKeyStoreBIP44Selectables(msg.chainId, msg.paths);
  };
};

const handleSetKeyStoreCoinTypeMsg: (
  service: AbstractKeyRingService
) => InternalHandler<SetKeyStoreCoinTypeMsg> = (service) => {
  return async (_, msg) => {
    await service.setKeyStoreCoinType(msg.chainId, msg.coinType);
    return service.keyRingStatus;
  };
};

const handleCheckPasswordMsg: (
  service: AbstractKeyRingService
) => InternalHandler<CheckPasswordMsg> = (service) => {
  return (_, msg) => {
    return service.checkPassword(msg.password);
  };
};

const handleExportKeyRingDatasMsg: (
  service: AbstractKeyRingService
) => InternalHandler<ExportKeyRingDatasMsg> = (service) => {
  return async (_, msg) => {
    return await service.exportKeyRingDatas(msg.password);
  };
};
