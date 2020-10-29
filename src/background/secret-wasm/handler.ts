import { Env, Handler, InternalHandler, Message } from "../../common/message";
import { ReqeustEncryptMsg, RequestDecryptMsg } from "./messages";
import { SecretWasmKeeper } from "./keeper";

const Buffer = require("buffer/").Buffer;

export const getHandler: (keeper: SecretWasmKeeper) => Handler = (
  keeper: SecretWasmKeeper
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case ReqeustEncryptMsg:
        return handleReqeustEncryptMsg(keeper)(env, msg as ReqeustEncryptMsg);
      case RequestDecryptMsg:
        return handleRequestDecryptMsg(keeper)(env, msg as RequestDecryptMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleReqeustEncryptMsg: (
  keeper: SecretWasmKeeper
) => InternalHandler<ReqeustEncryptMsg> = keeper => {
  return async (env, msg) => {
    await keeper.checkAccessOrigin(
      env.extensionBaseURL,
      msg.chainId,
      msg.origin
    );

    // TODO: Should ask for user whether approve or reject to encrypt.
    return Buffer.from(
      await keeper.encrypt(msg.chainId, msg.contractCodeHash, msg.msg)
    ).toString("hex");
  };
};

const handleRequestDecryptMsg: (
  keeper: SecretWasmKeeper
) => InternalHandler<RequestDecryptMsg> = keeper => {
  return async (env, msg) => {
    await keeper.checkAccessOrigin(
      env.extensionBaseURL,
      msg.chainId,
      msg.origin
    );

    // XXX: Is there need to ask for user whether approve or reject to decrypt?
    return Buffer.from(
      await keeper.decrypt(
        msg.chainId,
        Buffer.from(msg.cipherTextHex, "hex"),
        Buffer.from(msg.nonceHex, "hex")
      )
    ).toString("hex");
  };
};
