import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { GetPubkeyMsg, ReqeustEncryptMsg, RequestDecryptMsg } from "./messages";
import { SecretWasmService } from "./service";

import { Buffer } from "buffer/";

export const getHandler: (service: SecretWasmService) => Handler = (
  service: SecretWasmService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetPubkeyMsg:
        return handleGetPubkeyMsg(service)(env, msg as GetPubkeyMsg);
      case ReqeustEncryptMsg:
        return handleReqeustEncryptMsg(service)(env, msg as ReqeustEncryptMsg);
      case RequestDecryptMsg:
        return handleRequestDecryptMsg(service)(env, msg as RequestDecryptMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetPubkeyMsg: (
  service: SecretWasmService
) => InternalHandler<GetPubkeyMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return Buffer.from(await service.getPubkey(env, msg.chainId)).toString(
      "hex"
    );
  };
};

const handleReqeustEncryptMsg: (
  service: SecretWasmService
) => InternalHandler<ReqeustEncryptMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    // TODO: Should ask for user whether approve or reject to encrypt.
    return Buffer.from(
      await service.encrypt(env, msg.chainId, msg.contractCodeHash, msg.msg)
    ).toString("hex");
  };
};

const handleRequestDecryptMsg: (
  service: SecretWasmService
) => InternalHandler<RequestDecryptMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    // XXX: Is there need to ask for user whether approve or reject to decrypt?
    return Buffer.from(
      await service.decrypt(
        env,
        msg.chainId,
        Buffer.from(msg.cipherTextHex, "hex"),
        Buffer.from(msg.nonceHex, "hex")
      )
    ).toString("hex");
  };
};
