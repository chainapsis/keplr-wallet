import { Env, Handler, InternalHandler, Message } from "../../common/message";
import {
  EnableKeyRingMsg,
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  CreateMnemonicKeyMsg,
  CreatePrivateKeyMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  SetPathMsg,
  RequestSignMsg,
  ApproveSignMsg,
  RejectSignMsg,
  GetRequestedMessage,
  LockKeyRingMsg,
  ClearKeyRingMsg,
  RequestTxBuilderConfigMsg,
  GetRequestedTxBuilderConfigMsg,
  ApproveTxBuilderConfigMsg,
  RejectTxBuilderConfigMsg,
  ShowKeyRingMsg,
  GetKeyRingTypeMsg,
  AddMnemonicKeyMsg,
  AddPrivateKeyMsg,
  GetMultiKeyStoreInfoMsg,
  ChangeKeyRingMsg
} from "./messages";
import { KeyRingKeeper } from "./keeper";
import { Address } from "@everett-protocol/cosmosjs/crypto";

const Buffer = require("buffer/").Buffer;

export const getHandler: (keeper: KeyRingKeeper) => Handler = (
  keeper: KeyRingKeeper
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case EnableKeyRingMsg:
        return handleEnableKeyRingMsg(keeper)(env, msg as EnableKeyRingMsg);
      case RestoreKeyRingMsg:
        return handleRestoreKeyRingMsg(keeper)(env, msg as RestoreKeyRingMsg);
      case SaveKeyRingMsg:
        return handleSaveKeyRingMsg(keeper)(env, msg as SaveKeyRingMsg);
      case ClearKeyRingMsg:
        return handleClearKeyRingMsg(keeper)(env, msg as ClearKeyRingMsg);
      case ShowKeyRingMsg:
        return handleShowKeyRingMsg(keeper)(env, msg as ShowKeyRingMsg);
      case CreateMnemonicKeyMsg:
        return handleCreateMnemonicKeyMsg(keeper)(
          env,
          msg as CreateMnemonicKeyMsg
        );
      case AddMnemonicKeyMsg:
        return handleAddMnemonicKeyMsg(keeper)(env, msg as AddMnemonicKeyMsg);
      case CreatePrivateKeyMsg:
        return handleCreatePrivateKeyMsg(keeper)(
          env,
          msg as CreatePrivateKeyMsg
        );
      case AddPrivateKeyMsg:
        return handleAddPrivateKeyMsg(keeper)(env, msg as AddPrivateKeyMsg);
      case LockKeyRingMsg:
        return handleLockKeyRingMsg(keeper)(env, msg as LockKeyRingMsg);
      case UnlockKeyRingMsg:
        return handleUnlockKeyRingMsg(keeper)(env, msg as UnlockKeyRingMsg);
      case SetPathMsg:
        return handleSetPathMsg(keeper)(env, msg as SetPathMsg);
      case GetKeyMsg:
        return handleGetKeyMsg(keeper)(env, msg as GetKeyMsg);
      case RequestTxBuilderConfigMsg:
        return handleRequestTxBuilderConfigMsg(keeper)(
          env,
          msg as RequestTxBuilderConfigMsg
        );
      case GetRequestedTxBuilderConfigMsg:
        return handleGetRequestedTxBuilderConfig(keeper)(
          env,
          msg as GetRequestedTxBuilderConfigMsg
        );
      case ApproveTxBuilderConfigMsg:
        return handleApproveTxBuilderConfigMsg(keeper)(
          env,
          msg as ApproveTxBuilderConfigMsg
        );
      case RejectTxBuilderConfigMsg:
        return handleRejectTxBuilderConfigMsg(keeper)(
          env,
          msg as RejectTxBuilderConfigMsg
        );
      case RequestSignMsg:
        return handleRequestSignMsg(keeper)(env, msg as RequestSignMsg);
      case GetRequestedMessage:
        return handleGetRequestedMessage(keeper)(
          env,
          msg as GetRequestedMessage
        );
      case ApproveSignMsg:
        return handleApproveSignMsg(keeper)(env, msg as ApproveSignMsg);
      case RejectSignMsg:
        return handleRejectSignMsg(keeper)(env, msg as RejectSignMsg);
      case GetKeyRingTypeMsg:
        return handleGetKeyRingTypeMsg(keeper)(env, msg as GetKeyRingTypeMsg);
      case GetMultiKeyStoreInfoMsg:
        return handleGetMultiKeyStoreInfoMsg(keeper)(
          env,
          msg as GetMultiKeyStoreInfoMsg
        );
      case ChangeKeyRingMsg:
        return handleChangeKeyRingMsg(keeper)(env, msg as ChangeKeyRingMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleEnableKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<EnableKeyRingMsg> = keeper => {
  return async (env, msg) => {
    await keeper.checkAccessOrigin(
      env.extensionBaseURL,
      msg.chainId,
      msg.origin
    );

    // Will throw an error if chain is unknown.
    await keeper.chainsKeeper.getChainInfo(msg.chainId);

    return {
      status: await keeper.enable(env.extensionBaseURL)
    };
  };
};

const handleRestoreKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<RestoreKeyRingMsg> = keeper => {
  return async () => {
    return {
      status: await keeper.restore()
    };
  };
};

const handleSaveKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<SaveKeyRingMsg> = keeper => {
  return async () => {
    await keeper.save();
    return {
      success: true
    };
  };
};

const handleClearKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<ClearKeyRingMsg> = keeper => {
  return async (_, msg) => {
    return {
      status: await keeper.clear(msg.password)
    };
  };
};

const handleShowKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<ShowKeyRingMsg> = keeper => {
  return async (_, msg) => {
    return await keeper.showKeyRing(msg.password);
  };
};

const handleCreateMnemonicKeyMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<CreateMnemonicKeyMsg> = keeper => {
  return async (_, msg) => {
    return {
      status: await keeper.createMnemonicKey(
        msg.mnemonic,
        msg.password,
        msg.meta
      )
    };
  };
};

const handleAddMnemonicKeyMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<AddMnemonicKeyMsg> = keeper => {
  return async (_, msg) => {
    return await keeper.addMnemonicKey(msg.mnemonic, msg.meta);
  };
};

const handleCreatePrivateKeyMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<CreatePrivateKeyMsg> = keeper => {
  return async (_, msg) => {
    return {
      status: await keeper.createPrivateKey(
        Buffer.from(msg.privateKeyHex, "hex"),
        msg.password,
        msg.meta
      )
    };
  };
};

const handleAddPrivateKeyMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<AddPrivateKeyMsg> = keeper => {
  return async (_, msg) => {
    return await keeper.addPrivateKey(
      Buffer.from(msg.privateKeyHex, "hex"),
      msg.meta
    );
  };
};

const handleLockKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<LockKeyRingMsg> = keeper => {
  return () => {
    return {
      status: keeper.lock()
    };
  };
};

const handleUnlockKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<UnlockKeyRingMsg> = keeper => {
  return async (_, msg) => {
    return {
      status: await keeper.unlock(msg.password)
    };
  };
};

const handleSetPathMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<SetPathMsg> = keeper => {
  return async (_, msg) => {
    await keeper.setPath(msg.chainId, msg.account, msg.index);
    return {
      success: true
    };
  };
};

const handleGetKeyMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<GetKeyMsg> = keeper => {
  return async (env, msg) => {
    const getKeyMsg = msg as GetKeyMsg;
    await keeper.checkAccessOrigin(
      env.extensionBaseURL,
      getKeyMsg.chainId,
      getKeyMsg.origin
    );

    const key = await keeper.getKey();

    return {
      algo: "secp256k1",
      pubKeyHex: Buffer.from(key.pubKey).toString("hex"),
      addressHex: Buffer.from(key.address).toString("hex"),
      bech32Address: new Address(key.address).toBech32(
        (await keeper.chainsKeeper.getChainInfo(getKeyMsg.chainId)).bech32Config
          .bech32PrefixAccAddr
      )
    };
  };
};

const handleRequestTxBuilderConfigMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<RequestTxBuilderConfigMsg> = keeper => {
  return async (env, msg) => {
    // `config` in msg can't be null because `validateBasic` ensures that `config` is not null.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await keeper.checkAccessOrigin(
      env.extensionBaseURL,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      msg.config!.chainId,
      msg.origin
    );

    const config = await keeper.requestTxBuilderConfig(
      env.extensionBaseURL,
      // `config` in msg can't be null because `validateBasic` ensures that `config` is not null.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      msg.config!,
      msg.id,
      msg.openPopup,
      msg.skipApprove
    );
    return {
      config
    };
  };
};

const handleGetRequestedTxBuilderConfig: (
  keeper: KeyRingKeeper
) => InternalHandler<GetRequestedTxBuilderConfigMsg> = keeper => {
  return async (_, msg) => {
    const config = keeper.getRequestedTxConfig(msg.id);

    return {
      config
    };
  };
};

const handleApproveTxBuilderConfigMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<ApproveTxBuilderConfigMsg> = keeper => {
  return async (_, msg) => {
    // `config` in msg can't be null because `validateBasic` ensures that `config` is not null.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    keeper.approveTxBuilderConfig(msg.id, msg.config!);

    return {};
  };
};

const handleRejectTxBuilderConfigMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<RejectTxBuilderConfigMsg> = keeper => {
  return async (_, msg) => {
    keeper.rejectTxBuilderConfig(msg.id);

    return {};
  };
};

const handleRequestSignMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<RequestSignMsg> = keeper => {
  return async (env, msg) => {
    await keeper.checkAccessOrigin(
      env.extensionBaseURL,
      msg.chainId,
      msg.origin
    );

    await keeper.checkBech32Address(msg.chainId, msg.bech32Address);

    return {
      signatureHex: Buffer.from(
        await keeper.requestSign(
          env.extensionBaseURL,
          msg.chainId,
          new Uint8Array(Buffer.from(msg.messageHex, "hex")),
          msg.id,
          msg.openPopup,
          msg.skipApprove
        )
      ).toString("hex")
    };
  };
};

const handleGetRequestedMessage: (
  keeper: KeyRingKeeper
) => InternalHandler<GetRequestedMessage> = keeper => {
  return (_, msg) => {
    const message = keeper.getRequestedMessage(msg.id);

    return {
      chainId: message.chainId,
      messageHex: Buffer.from(message.message).toString("hex")
    };
  };
};

const handleApproveSignMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<ApproveSignMsg> = keeper => {
  return (_, msg) => {
    keeper.approveSign(msg.id);
    return;
  };
};

const handleRejectSignMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<RejectSignMsg> = keeper => {
  return (_, msg) => {
    keeper.rejectSign(msg.id);
    return;
  };
};

const handleGetKeyRingTypeMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<GetKeyRingTypeMsg> = keeper => {
  return () => {
    return keeper.getKeyRingType();
  };
};

const handleGetMultiKeyStoreInfoMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<GetMultiKeyStoreInfoMsg> = keeper => {
  return () => {
    return keeper.getMultiKeyStoreInfo();
  };
};

const handleChangeKeyRingMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<ChangeKeyRingMsg> = keeper => {
  return (_, msg) => {
    return keeper.changeKeyStoreFromMultiKeyStore(msg.index);
  };
};
