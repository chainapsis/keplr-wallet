import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { UmbralService } from "./service";
import {
  UmbralDecryptMsg,
  UmbralDecryptReEncryptedMsg,
  UmbralEncryptMsg,
  UmbralGenerateKeyFragsMsg,
  UmbralGetPublicKeyMsg,
  UmbralGetSigningPublicKeyMsg,
  UmbralVerifyCapsuleFragMsg,
} from "@fetchai/umbral-types";

export const getHandler: (service: UmbralService) => Handler = (
  service: UmbralService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case UmbralGetPublicKeyMsg:
        return handleGetPublicKeyMsg(service)(
          env,
          msg as UmbralGetPublicKeyMsg
        );
      case UmbralGetSigningPublicKeyMsg:
        return handleGetSigningPublicKeyMsg(service)(
          env,
          msg as UmbralGetSigningPublicKeyMsg
        );
      case UmbralEncryptMsg:
        return handleEncryptMsg(service)(env, msg as UmbralEncryptMsg);
      case UmbralGenerateKeyFragsMsg:
        return handleGenerateKeyFragsMsg(service)(
          env,
          msg as UmbralGenerateKeyFragsMsg
        );
      case UmbralDecryptMsg:
        return handleDecryptMsg(service)(env, msg as UmbralDecryptMsg);
      case UmbralDecryptReEncryptedMsg:
        return handleDecryptReEncryptedMsg(service)(
          env,
          msg as UmbralDecryptReEncryptedMsg
        );
      case UmbralVerifyCapsuleFragMsg:
        return handleVerifyCapsuleFragMsg(service)(
          env,
          msg as UmbralVerifyCapsuleFragMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetPublicKeyMsg: (
  service: UmbralService
) => InternalHandler<UmbralGetPublicKeyMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.getPublicKey(env, msg.chainId);
  };
};

const handleGetSigningPublicKeyMsg: (
  service: UmbralService
) => InternalHandler<UmbralGetSigningPublicKeyMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.getSigningPublicKey(env, msg.chainId);
  };
};

const handleEncryptMsg: (
  service: UmbralService
) => InternalHandler<UmbralEncryptMsg> = (service) => {
  return async (env, msg) => {
    return await service.encrypt(env, msg.pubKey, msg.plainTextBytes);
  };
};

const handleGenerateKeyFragsMsg: (
  service: UmbralService
) => InternalHandler<UmbralGenerateKeyFragsMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    const fragments = await service.generateKeyFragments(
      env,
      msg.chainId,
      msg.receiverPublicKey,
      msg.threshold,
      msg.shares
    );
    return { fragments };
  };
};

const handleDecryptMsg: (
  service: UmbralService
) => InternalHandler<UmbralDecryptMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.decrypt(
      env,
      msg.chainId,
      msg.capsuleBytes,
      msg.cipherTextBytes
    );
  };
};

const handleDecryptReEncryptedMsg: (
  service: UmbralService
) => InternalHandler<UmbralDecryptReEncryptedMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.decryptReEncrypted(
      env,
      msg.chainId,
      msg.senderPublicKey,
      msg.capsule,
      msg.capsuleFragments,
      msg.cipherTextBytes
    );
  };
};

const handleVerifyCapsuleFragMsg: (
  service: UmbralService
) => InternalHandler<UmbralVerifyCapsuleFragMsg> = (service) => {
  return async (_env, msg) => {
    return await service.verifyCapsuleFragment(
      msg.capsuleFragment,
      msg.capsule,
      msg.verifyingPublicKey,
      msg.senderPublicKey,
      msg.receiverPublicKey
    );
  };
};
