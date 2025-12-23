import { Handler, InternalHandler, Env, Message } from "@keplr-wallet/router";
import { SecretWasmService } from "./service";
import { PermissionService } from "../permission";
import {
  GetPubkeyMsg,
  GetTxEncryptionKeyMsg,
  IsNewApiMsg,
  ReqeustEncryptMsg,
  RequestDecryptMsg,
} from "./messages";

export const getHandler: (
  service: SecretWasmService,
  permissionService: PermissionService
) => Handler = (service, permissionService) => {
  return {
    getPubkey: handleGetPubkeyMsg(service, permissionService),
    encrypt: handleReqeustEncryptMsg(service, permissionService),
    decrypt: handleRequestDecryptMsg(service, permissionService),
    getTxEncryptionKey: handleGetTxEncryptionKeyMsg(
      service,
      permissionService
    ),
    isNewApi: handleIsNewApiMsg(service, permissionService),
  };
};

const handleGetPubkeyMsg: (
  service: SecretWasmService,
  permissionService: PermissionService
) => InternalHandler<GetPubkeyMsg> = (service, permissionService) => {
  return async (env: Env, msg: GetPubkeyMsg & { origin: string }) => {
    await permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.getPubkey(msg.chainId);
  };
};

const handleIsNewApiMsg: (
  service: SecretWasmService,
  permissionService: PermissionService
) => InternalHandler<IsNewApiMsg> = (service, permissionService) => {
  return async (env: Env, msg: IsNewApiMsg & { origin: string }) => {
    await permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.isNewApi(msg.chainId);
  };
};

const handleReqeustEncryptMsg: (
  service: SecretWasmService,
  permissionService: PermissionService
) => InternalHandler<ReqeustEncryptMsg> = (service, permissionService) => {
  return async (env: Env, msg: ReqeustEncryptMsg & { origin: string }) => {
    await permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    await permissionService.checkOrGrantPermission(
      env,
      [msg.chainId],
      "secret-wasm-encryption",
      msg.origin
    );

    return await service.encrypt(msg.chainId, msg.contractCodeHash, msg.msg);
  };
};

const handleRequestDecryptMsg: (
  service: SecretWasmService,
  permissionService: PermissionService
) => InternalHandler<RequestDecryptMsg> = (service, permissionService) => {
  return async (env: Env, msg: RequestDecryptMsg & { origin: string }) => {
    await permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.decrypt(msg.chainId, msg.cipherText, msg.nonce);
  };
};

const handleGetTxEncryptionKeyMsg: (
  service: SecretWasmService,
  permissionService: PermissionService
) => InternalHandler<GetTxEncryptionKeyMsg> = (service, permissionService) => {
  return async (env: Env, msg: GetTxEncryptionKeyMsg & { origin: string }) => {
    await permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.getTxEncryptionKey(msg.chainId, msg.nonce);
  };
};
