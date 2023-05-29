import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  GetPubkeyMsg,
  GetTxEncryptionKeyMsg,
  ReqeustEncryptMsg,
  RequestDecryptMsg,
} from "./messages";
import { SecretWasmService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: SecretWasmService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (service, permissionInteractionService) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetPubkeyMsg:
        return handleGetPubkeyMsg(service, permissionInteractionService)(
          env,
          msg as GetPubkeyMsg
        );
      case ReqeustEncryptMsg:
        return handleReqeustEncryptMsg(service, permissionInteractionService)(
          env,
          msg as ReqeustEncryptMsg
        );
      case RequestDecryptMsg:
        return handleRequestDecryptMsg(service, permissionInteractionService)(
          env,
          msg as RequestDecryptMsg
        );
      case GetTxEncryptionKeyMsg:
        return handleGetTxEncryptionKeyMsg(
          service,
          permissionInteractionService
        )(env, msg as GetTxEncryptionKeyMsg);
      default:
        throw new KeplrError("secret-wasm", 120, "Unknown msg type");
    }
  };
};

const handleGetPubkeyMsg: (
  service: SecretWasmService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetPubkeyMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.getPubkey(msg.chainId);
  };
};

const handleReqeustEncryptMsg: (
  service: SecretWasmService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<ReqeustEncryptMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    // TODO: Should ask for user whether approve or reject to encrypt.
    return await service.encrypt(msg.chainId, msg.contractCodeHash, msg.msg);
  };
};

const handleRequestDecryptMsg: (
  service: SecretWasmService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestDecryptMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    // XXX: Is there need to ask for user whether approve or reject to decrypt?
    return await service.decrypt(msg.chainId, msg.cipherText, msg.nonce);
  };
};

const handleGetTxEncryptionKeyMsg: (
  service: SecretWasmService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetTxEncryptionKeyMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    // XXX: Is there need to ask for user whether approve or reject to getting tx encryption key?
    return await service.getTxEncryptionKey(msg.chainId, msg.nonce);
  };
};
