import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
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
  RequestSignEIP712CosmosTxMsg_v0,
  InitNonDefaultLedgerAppMsg,
  CreateKeystoneKeyMsg,
  AddKeystoneKeyMsg,
  RequestICNSAdr36SignaturesMsg,
  ChangeKeyRingNameMsg,
  StatusMsg,
  LockWalletMsg,
  UnlockWalletMsg,
  CurrentAccountMsg,
  RequestSignAminoMsgFetchSigning,
  RequestSignDirectMsgFetchSigning,
  RequestVerifyADR36AminoSignDocFetchSigning,
  SwitchAccountMsg,
  ListAccountsMsg,
  GetAccountMsg,
  RestoreWalletMsg,
  GetKeyMsgFetchSigning,
} from "./messages";
import { KeyRingService } from "./service";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { SignDoc } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { KeyRingStatus } from "./keyring";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { Account, WalletStatus } from "@fetchai/wallet-types";

export const getHandler: (service: KeyRingService) => Handler = (
  service: KeyRingService
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
      case CreateKeystoneKeyMsg:
        return handleCreateKeystoneKeyMsg(service)(
          env,
          msg as CreateKeystoneKeyMsg
        );
      case CreateLedgerKeyMsg:
        return handleCreateLedgerKeyMsg(service)(
          env,
          msg as CreateLedgerKeyMsg
        );
      case AddKeystoneKeyMsg:
        return handleAddKeystoneKeyMsg(service)(env, msg as AddKeystoneKeyMsg);
      case AddLedgerKeyMsg:
        return handleAddLedgerKeyMsg(service)(env, msg as AddLedgerKeyMsg);
      case LockKeyRingMsg:
        return handleLockKeyRingMsg(service)(env, msg as LockKeyRingMsg);
      case UnlockKeyRingMsg:
        return handleUnlockKeyRingMsg(service)(env, msg as UnlockKeyRingMsg);
      case GetKeyMsg:
        return handleGetKeyMsg(service)(env, msg as GetKeyMsg);
      case GetAccountMsg:
        return handleGetAccountMsg(service)(env, msg as GetAccountMsg);
      case RequestSignAminoMsg:
        return handleRequestSignAminoMsg(service)(
          env,
          msg as RequestSignAminoMsg
        );
      case RequestSignEIP712CosmosTxMsg_v0:
        return handleRequestSignEIP712CosmosTxMsg_v0(service)(
          env,
          msg as RequestSignEIP712CosmosTxMsg_v0
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
      case RequestICNSAdr36SignaturesMsg:
        return handleRequestICNSAdr36SignaturesMsg(service)(
          env,
          msg as RequestICNSAdr36SignaturesMsg
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
      case InitNonDefaultLedgerAppMsg:
        return handleInitNonDefaultLedgerAppMsg(service)(
          env,
          msg as InitNonDefaultLedgerAppMsg
        );
      case ChangeKeyRingNameMsg:
        return handleChangeKeyNameMsg(service)(
          env,
          msg as ChangeKeyRingNameMsg
        );
      case StatusMsg:
        return handleStatusMsg(service)(env, msg as StatusMsg);
      case RestoreWalletMsg:
        return handleRestoreWalletMsg(service)(env, msg as StatusMsg);
      case LockWalletMsg:
        return handleLockWallet(service)(env, msg as LockWalletMsg);
      case UnlockWalletMsg:
        return handleUnlockWallet(service)(env, msg as UnlockWalletMsg);
      case CurrentAccountMsg:
        return handleCurrentAccountMsg(service)(env, msg as CurrentAccountMsg);
      case SwitchAccountMsg:
        return handleSwitchAccountMsg(service)(env, msg as SwitchAccountMsg);
      case ListAccountsMsg:
        return handleListAccountsMsg(service)(env, msg as ListAccountsMsg);
      case GetKeyMsgFetchSigning:
        return handleGetKeyMsgFetchSigning(service)(
          env,
          msg as GetKeyMsgFetchSigning
        );
      case RequestSignAminoMsgFetchSigning:
        return handleRequestSignAminoMsgFetchSigning(service)(
          env,
          msg as RequestSignAminoMsgFetchSigning
        );
      case RequestSignDirectMsgFetchSigning:
        return handleRequestSignDirectMsgFetchSigning(service)(
          env,
          msg as RequestSignDirectMsgFetchSigning
        );
      case RequestVerifyADR36AminoSignDocFetchSigning:
        return handleRequestVerifyADR36AminoSignDocFetchSigning(service)(
          env,
          msg as RequestVerifyADR36AminoSignDocFetchSigning
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

const handleDeleteKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<DeleteKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.deleteKeyRing(msg.index, msg.password);
  };
};

const handleUpdateNameKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<UpdateNameKeyRingMsg> = (service) => {
  return async (_, msg) => {
    return await service.updateNameKeyRing(msg.index, msg.name);
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
  service: KeyRingService
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
  service: KeyRingService
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
  service: KeyRingService
) => InternalHandler<AddPrivateKeyMsg> = (service) => {
  return async (_, msg) => {
    return await service.addPrivateKey(msg.kdf, msg.privateKey, msg.meta);
  };
};

const handleCreateKeystoneKeyMsg: (
  service: KeyRingService
) => InternalHandler<CreateKeystoneKeyMsg> = (service) => {
  return async (env, msg) => {
    return await service.createKeystoneKey(
      env,
      msg.kdf,
      msg.password,
      msg.meta,
      msg.bip44HDPath
    );
  };
};

const handleCreateLedgerKeyMsg: (
  service: KeyRingService
) => InternalHandler<CreateLedgerKeyMsg> = (service) => {
  return async (env, msg) => {
    return await service.createLedgerKey(
      env,
      msg.kdf,
      msg.password,
      msg.meta,
      msg.bip44HDPath,
      msg.cosmosLikeApp
    );
  };
};

const handleAddKeystoneKeyMsg: (
  service: KeyRingService
) => InternalHandler<AddKeystoneKeyMsg> = (service) => {
  return async (env, msg) => {
    return await service.addKeystoneKey(
      env,
      msg.kdf,
      msg.meta,
      msg.bip44HDPath
    );
  };
};

const handleAddLedgerKeyMsg: (
  service: KeyRingService
) => InternalHandler<AddLedgerKeyMsg> = (service) => {
  return async (env, msg) => {
    return await service.addLedgerKey(
      env,
      msg.kdf,
      msg.meta,
      msg.bip44HDPath,
      msg.cosmosLikeApp
    );
  };
};

const handleLockKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<LockKeyRingMsg> = (service) => {
  const status = service.lock();
  return () => {
    return {
      status,
    };
  };
};

const handleUnlockKeyRingMsg: (
  service: KeyRingService
) => InternalHandler<UnlockKeyRingMsg> = (service) => {
  return async (_, msg) => {
    const status = await service.unlock(msg.password);
    return {
      status,
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
      pubKey: key.pubKey,
      address: key.address,
      bech32Address: new Bech32Address(key.address).toBech32(
        (await service.chainsService.getChainInfo(msg.chainId)).bech32Config
          .bech32PrefixAccAddr
      ),
      isNanoLedger: key.isNanoLedger,
      isKeystone: key.isKeystone,
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

const handleRequestSignEIP712CosmosTxMsg_v0: (
  service: KeyRingService
) => InternalHandler<RequestSignEIP712CosmosTxMsg_v0> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.requestSignEIP712CosmosTx_v0(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.eip712,
      msg.signDoc,
      msg.signOptions
    );
  };
};

const handleRequestVerifyADR36AminoSignDoc: (
  service: KeyRingService
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
  service: KeyRingService
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

const handleRequestICNSAdr36SignaturesMsg: (
  service: KeyRingService
) => InternalHandler<RequestICNSAdr36SignaturesMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return service.requestICNSAdr36Signatures(
      env,
      msg.chainId,
      msg.contractAddress,
      msg.owner,
      msg.username,
      msg.addressChainIds
    );
  };
};

const handleGetMultiKeyStoreInfoMsg: (
  service: KeyRingService
) => InternalHandler<GetMultiKeyStoreInfoMsg> = (service) => {
  return () => {
    return {
      multiKeyStoreInfo: service.getMultiKeyStoreInfo(),
    };
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

const handleCheckPasswordMsg: (
  service: KeyRingService
) => InternalHandler<CheckPasswordMsg> = (service) => {
  return (_, msg) => {
    return service.checkPassword(msg.password);
  };
};

const handleExportKeyRingDatasMsg: (
  service: KeyRingService
) => InternalHandler<ExportKeyRingDatasMsg> = (service) => {
  return async (_, msg) => {
    return await service.exportKeyRingDatas(msg.password);
  };
};

const handleInitNonDefaultLedgerAppMsg: (
  service: KeyRingService
) => InternalHandler<InitNonDefaultLedgerAppMsg> = (service) => {
  return async (env, msg) => {
    await service.initializeNonDefaultLedgerApp(env, msg.ledgerApp);
  };
};

const handleChangeKeyNameMsg: (
  service: KeyRingService
) => InternalHandler<ChangeKeyRingNameMsg> = (service) => {
  return async (env, msg) => {
    // Ensure that keyring is unlocked and selected.
    await service.enable(env);

    let index = -1;
    service.getMultiKeyStoreInfo().forEach(({ selected }, idx) => {
      if (selected) {
        index = idx;
      }
    });

    if (index === -1) {
      throw new Error("No account selected");
    }

    return await service.changeKeyRingName(env, index, {
      defaultName: msg.defaultName,
      editable: msg.editable,
    });
  };
};

const handleRestoreWalletMsg: (
  service: KeyRingService
) => InternalHandler<RestoreWalletMsg> = (service) => {
  return async () => {
    const { status } = await service.restore();
    if (status === KeyRingStatus.EMPTY) {
      return WalletStatus.EMPTY;
    } else if (status === KeyRingStatus.LOCKED) {
      return WalletStatus.LOCKED;
    } else if (status === KeyRingStatus.NOTLOADED) {
      return WalletStatus.NOTLOADED;
    } else if (status === KeyRingStatus.UNLOCKED) {
      return WalletStatus.UNLOCKED;
    } else return WalletStatus.NOTLOADED;
  };
};

const handleStatusMsg: (
  service: KeyRingService
) => InternalHandler<StatusMsg> = (service) => {
  return () => {
    const status = service.keyRingStatus;
    if (status === KeyRingStatus.EMPTY) {
      return WalletStatus.EMPTY;
    } else if (status === KeyRingStatus.LOCKED) {
      return WalletStatus.LOCKED;
    } else if (status === KeyRingStatus.NOTLOADED) {
      return WalletStatus.NOTLOADED;
    } else if (status === KeyRingStatus.UNLOCKED) {
      return WalletStatus.UNLOCKED;
    } else return WalletStatus.NOTLOADED;
  };
};

const handleLockWallet: (
  service: KeyRingService
) => InternalHandler<LockWalletMsg> = (service) => {
  return () => {
    service.lock();
  };
};

const handleUnlockWallet: (
  service: KeyRingService
) => InternalHandler<UnlockWalletMsg> = (service) => {
  return async (env, _) => {
    await service.enable(env);
  };
};

const handleCurrentAccountMsg: (
  service: KeyRingService
) => InternalHandler<CurrentAccountMsg> = (service) => {
  return async (env, msg) => {
    const chainId = await service.chainsService.getSelectedChain();
    await service.permissionService.checkBasicAccessPermission(
      env,
      [chainId],
      msg.origin
    );

    const key = await service.getKey(chainId);

    const chainInfo = await service.chainsService.getChainInfo(chainId);
    const isEVM = chainInfo.features?.includes("evm");
    const bech32Add = new Bech32Address(key.address).toBech32(
      chainInfo.bech32Config.bech32PrefixAccAddr
    );

    const hexadd = Bech32Address.fromBech32(
      bech32Add,
      chainInfo.bech32Config.bech32PrefixAccAddr
    ).toHex(true);

    const acc: Account = {
      name: service.getKeyStoreMeta("name"),
      algo: key.algo,
      pubKey: key.pubKey,
      address: key.address,
      bech32Address: isEVM ? "" : bech32Add,
      isNanoLedger: key.isNanoLedger,
      isKeystone: key.isKeystone,
      EVMAddress: isEVM ? hexadd : "",
    };
    return acc;
  };
};

const handleSwitchAccountMsg: (
  service: KeyRingService
) => InternalHandler<SwitchAccountMsg> = (service) => {
  return async (env, msg) => {
    const chainId = await service.chainsService.getSelectedChain();
    await service.permissionService.checkBasicAccessPermission(
      env,
      [chainId],
      msg.origin
    );

    await service.switchAccountByAddress(env, msg.address, msg.origin);
  };
};

const handleListAccountsMsg: (
  service: KeyRingService
) => InternalHandler<ListAccountsMsg> = (service) => {
  return async (env, msg) => {
    const chainId = await service.chainsService.getSelectedChain();
    await service.permissionService.checkBasicAccessPermission(
      env,
      [chainId],
      msg.origin
    );

    const keys = await service.getKeys(chainId);
    const chainInfo = await service.chainsService.getChainInfo(chainId);
    const isEVM = chainInfo.features?.includes("evm");
    const returnData: Account[] = [];

    keys.forEach((key) => {
      const bech32Add = new Bech32Address(key.address).toBech32(
        chainInfo.bech32Config.bech32PrefixAccAddr
      );
      returnData.push({
        name: key.name,
        algo: key.algo,
        pubKey: key.pubKey,
        address: key.address,
        bech32Address: isEVM ? "" : bech32Add,
        isNanoLedger: key.isNanoLedger,
        isKeystone: key.isKeystone,
        EVMAddress: isEVM
          ? Bech32Address.fromBech32(
              bech32Add,
              chainInfo.bech32Config.bech32PrefixAccAddr
            ).toHex(true)
          : "",
      });
    });

    return returnData;
  };
};

const handleRequestSignAminoMsgFetchSigning: (
  service: KeyRingService
) => InternalHandler<RequestSignAminoMsgFetchSigning> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkBasicAccessPermission(
      env,
      [msg.chainId],
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

const handleRequestSignDirectMsgFetchSigning: (
  service: KeyRingService
) => InternalHandler<RequestSignDirectMsgFetchSigning> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkBasicAccessPermission(
      env,
      [msg.chainId],
      msg.origin
    );

    const signDoc = SignDoc.fromPartial({
      bodyBytes:
        msg.signDoc.bodyBytes === null ? undefined : msg.signDoc.bodyBytes,
      authInfoBytes:
        msg.signDoc.authInfoBytes === null
          ? undefined
          : msg.signDoc.authInfoBytes,
      chainId: msg.signDoc.chainId === null ? undefined : msg.signDoc.chainId,
      accountNumber:
        msg.signDoc.accountNumber === null
          ? undefined
          : msg.signDoc.accountNumber,
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

const handleRequestVerifyADR36AminoSignDocFetchSigning: (
  service: KeyRingService
) => InternalHandler<RequestVerifyADR36AminoSignDocFetchSigning> = (
  service
) => {
  return async (env, msg) => {
    await service.permissionService.checkBasicAccessPermission(
      env,
      [msg.chainId],
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

const handleGetAccountMsg: (
  service: KeyRingService
) => InternalHandler<GetAccountMsg> = (service) => {
  return async (env, msg) => {
    const kvStore = new ExtensionKVStore("store_chain_config");
    const chainId = await kvStore.get<string>("extension_last_view_chain_id");
    if (!chainId) {
      throw Error("could not detect current chainId");
    }

    await service.permissionService.checkBasicAccessPermission(
      env,
      [chainId],
      msg.origin
    );

    const keys = await service.getKeys(chainId);

    const chainInfo = await service.chainsService.getChainInfo(chainId);
    const isEVM = chainInfo.features?.includes("evm");
    let foundAccount: Account | null = null;
    keys.forEach((key) => {
      const bech32Add = new Bech32Address(key.address).toBech32(
        chainInfo.bech32Config.bech32PrefixAccAddr
      );
      const hexAdd = Bech32Address.fromBech32(
        bech32Add,
        chainInfo.bech32Config.bech32PrefixAccAddr
      ).toHex(true);
      if (msg.address === bech32Add || msg.address === hexAdd) {
        foundAccount = {
          name: key.name,
          algo: key.algo,
          pubKey: key.pubKey,
          address: key.address,
          bech32Address: isEVM ? "" : bech32Add,
          isNanoLedger: key.isNanoLedger,
          isKeystone: key.isKeystone,
          EVMAddress: isEVM ? hexAdd : "",
        } as Account;
      }
    });
    return foundAccount;
  };
};

const handleGetKeyMsgFetchSigning: (
  service: KeyRingService
) => InternalHandler<GetKeyMsgFetchSigning> = (service) => {
  return async (env, msg) => {
    const chainId = await service.chainsService.getSelectedChain();
    await service.permissionService.checkBasicAccessPermission(
      env,
      [chainId],
      msg.origin
    );

    const key = await service.getKey(chainId);

    const chainInfo = await service.chainsService.getChainInfo(chainId);
    const isEVM = chainInfo.features?.includes("evm");
    const bech32Add = new Bech32Address(key.address).toBech32(
      chainInfo.bech32Config.bech32PrefixAccAddr
    );

    const hexadd = Bech32Address.fromBech32(
      bech32Add,
      chainInfo.bech32Config.bech32PrefixAccAddr
    ).toHex(true);

    const acc: Account = {
      name: service.getKeyStoreMeta("name"),
      algo: key.algo,
      pubKey: key.pubKey,
      address: key.address,
      bech32Address: isEVM ? "" : bech32Add,
      isNanoLedger: key.isNanoLedger,
      isKeystone: key.isKeystone,
      EVMAddress: isEVM ? hexadd : "",
    };
    return acc;
  };
};
