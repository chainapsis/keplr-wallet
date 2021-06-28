import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import {
  GetPubkeyMsg,
  GetTxEncryptionKeyMsg,
  ReqeustEncryptMsg,
  RequestDecryptMsg,
} from "./messages";
import { SecretWasmService } from "./service";

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
      case GetTxEncryptionKeyMsg:
        return handleGetTxEncryptionKeyMsg(service)(
          env,
          msg as GetTxEncryptionKeyMsg
        );
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

    return await service.getPubkey(env, msg.chainId);
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
    return await service.encrypt(
      env,
      msg.chainId,
      msg.contractCodeHash,
      msg.msg
    );
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
    return await service.decrypt(env, msg.chainId, msg.cipherText, msg.nonce);
  };
};

const handleGetTxEncryptionKeyMsg: (
  service: SecretWasmService
) => InternalHandler<GetTxEncryptionKeyMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    // XXX: Is there need to ask for user whether approve or reject to getting tx encryption key?
    return await service.getTxEncryptionKey(env, msg.chainId, msg.nonce);
  };
};
