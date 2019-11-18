import { Handler, InternalHandler, Message } from "../../common/message";
import {
  RestoreKeyRingMsg,
  SaveKeyRingMsg,
  CreateKeyMsg,
  GetKeyMsg,
  UnlockKeyRingMsg,
  SetPathMsg,
  RequestSignMsg,
  ApproveSignMsg,
  RejectSignMsg,
  GetRequestedMessage,
  GetRegisteredChainMsg,
  LockKeyRingMsg
} from "./messages";
import { KeyRingKeeper } from "./keeper";
import { Address } from "@everett-protocol/cosmosjs/crypto";

const Buffer = require("buffer/").Buffer;

export const getHandler: () => Handler = () => {
  const keeper = new KeyRingKeeper();

  return (msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetRegisteredChainMsg:
        return handleGetRegisteredChainMsg(keeper)(
          msg as GetRegisteredChainMsg
        );
      case RestoreKeyRingMsg:
        return handleRestoreKeyRingMsg(keeper)(msg as RestoreKeyRingMsg);
      case SaveKeyRingMsg:
        return handleSaveKeyRingMsg(keeper)(msg as SaveKeyRingMsg);
      case CreateKeyMsg:
        return handleCreateKeyMsg(keeper)(msg as CreateKeyMsg);
      case LockKeyRingMsg:
        return handleLockKeyRingMsg(keeper)(msg as LockKeyRingMsg);
      case UnlockKeyRingMsg:
        return handleUnlockKeyRingMsg(keeper)(msg as UnlockKeyRingMsg);
      case SetPathMsg:
        return handleSetPathMsg(keeper)(msg as SetPathMsg);
      case GetKeyMsg:
        return handleGetKeyMsg(keeper)(msg as GetKeyMsg);
      case RequestSignMsg:
        return handleRequestSignMsg(keeper)(msg as RequestSignMsg);
      case GetRequestedMessage:
        return handleGetRequestedMessage(keeper)(msg as GetRequestedMessage);
      case ApproveSignMsg:
        return handleApproveSignMsg(keeper)(msg as ApproveSignMsg);
      case RejectSignMsg:
        return handleRejectSignMsg(keeper)(msg as RejectSignMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetRegisteredChainMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<GetRegisteredChainMsg> = keeper => {
  return () => {
    return {
      chainInfos: keeper.getRegisteredChains()
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

const handleCreateKeyMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<CreateKeyMsg> = keeper => {
  return async msg => {
    return {
      status: await keeper.createKey(msg.mnemonic, msg.password)
    };
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
  return async msg => {
    return {
      status: await keeper.unlock(msg.password)
    };
  };
};

const handleSetPathMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<SetPathMsg> = keeper => {
  return async msg => {
    keeper.setPath(msg.chainId, msg.account, msg.index);
    return {
      success: true
    };
  };
};

const handleGetKeyMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<GetKeyMsg> = keeper => {
  return async msg => {
    const getKeyMsg = msg as GetKeyMsg;
    if (getKeyMsg.origin) {
      keeper.checkAccessOrigin(getKeyMsg.chainId, getKeyMsg.origin);
    }

    const key = await keeper.getKey();

    return {
      algo: "secp256k1",
      pubKeyHex: Buffer.from(key.pubKey).toString("hex"),
      addressHex: Buffer.from(key.address).toString("hex"),
      bech32Address: new Address(key.address).toBech32(
        keeper.getChainInfo(getKeyMsg.chainId).bech32Config.bech32PrefixAccAddr
      )
    };
  };
};

const handleRequestSignMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<RequestSignMsg> = keeper => {
  return async msg => {
    if (msg.origin) {
      keeper.checkAccessOrigin(msg.chainId, msg.origin);
    }

    await keeper.checkBech32Address(msg.chainId, msg.bech32Address);

    return {
      signatureHex: Buffer.from(
        await keeper.requestSign(
          msg.chainId,
          new Uint8Array(Buffer.from(msg.messageHex, "hex")),
          msg.index,
          msg.openPopup
        )
      ).toString("hex")
    };
  };
};

const handleGetRequestedMessage: (
  keeper: KeyRingKeeper
) => InternalHandler<GetRequestedMessage> = keeper => {
  return msg => {
    const message = keeper.getRequestedMessage(msg.index);

    return {
      chainId: message.chainId,
      messageHex: Buffer.from(message.message).toString("hex")
    };
  };
};

const handleApproveSignMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<ApproveSignMsg> = keeper => {
  return msg => {
    keeper.approveSign(msg.index);
    return;
  };
};

const handleRejectSignMsg: (
  keeper: KeyRingKeeper
) => InternalHandler<RejectSignMsg> = keeper => {
  return msg => {
    keeper.rejectSign(msg.index);
    return;
  };
};
