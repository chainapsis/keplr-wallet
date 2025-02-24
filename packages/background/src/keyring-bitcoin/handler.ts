import {
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";

import { Env } from "@keplr-wallet/router";
import { KeyRingBitcoinService } from "./service";
import { PermissionInteractiveService } from "src/permission-interactive";
import {
  GetBitcoinKeyMsg,
  GetBitcoinKeysForEachVaultSettledMsg,
  GetBitcoinKeysSettledMsg,
  RequestSignBitcoinMessageMsg,
  RequestSignBitcoinPsbtMsg,
  RequestSignBitcoinPsbtsMsg,
} from "./messages";

export const getHandler: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (
  _service: KeyRingBitcoinService,
  _permissionInteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetBitcoinKeyMsg:
        return handleGetBitcoinKeyMsg(_service, _permissionInteractionService)(
          env,
          msg as GetBitcoinKeyMsg
        );
      case GetBitcoinKeysSettledMsg:
        return handleGetBitcoinKeysSettledMsg(
          _service,
          _permissionInteractionService
        )(env, msg as GetBitcoinKeysSettledMsg);
      case GetBitcoinKeysForEachVaultSettledMsg:
        return handleGetBitcoinKeysForEachVaultSettledMsg(
          _service,
          _permissionInteractionService
        )(env, msg as GetBitcoinKeysForEachVaultSettledMsg);
      case RequestSignBitcoinPsbtMsg:
        return handleRequestSignBitcoinPsbtMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestSignBitcoinPsbtMsg);
      case RequestSignBitcoinPsbtsMsg:
        return handleRequestSignBitcoinPsbtsMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestSignBitcoinPsbtsMsg);

      case RequestSignBitcoinMessageMsg:
        return handleRequestSignBitcoinMessageMsg(
          _service,
          _permissionInteractionService
        )(env, msg as RequestSignBitcoinMessageMsg);
      default:
        throw new KeplrError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleGetBitcoinKeyMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetBitcoinKeyMsg> = (
  _service,
  _permissionInteractionService
) => {
  return async (_env, _msg) => {
    throw new KeplrError("keyring", 221, "Not implemented");
  };
};

const handleGetBitcoinKeysSettledMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetBitcoinKeysSettledMsg> = (
  _service,
  _permissionInteractionService
) => {
  return async (_env, _msg) => {
    throw new KeplrError("keyring", 221, "Not implemented");
  };
};

const handleGetBitcoinKeysForEachVaultSettledMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetBitcoinKeysForEachVaultSettledMsg> = (
  _service,
  _permissionInteractionService
) => {
  return async (_env, _msg) => {
    throw new KeplrError("keyring", 221, "Not implemented");
  };
};

const handleRequestSignBitcoinPsbtMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignBitcoinPsbtMsg> = (
  _service,
  _permissionInteractionService
) => {
  return async (_env, _msg) => {
    throw new KeplrError("keyring", 221, "Not implemented");
  };
};

const handleRequestSignBitcoinPsbtsMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignBitcoinPsbtsMsg> = (
  _service,
  _permissionInteractionService
) => {
  return async (_env, _msg) => {
    throw new KeplrError("keyring", 221, "Not implemented");
  };
};

const handleRequestSignBitcoinMessageMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignBitcoinMessageMsg> = (
  _service,
  _permissionInteractionService
) => {
  return async (_env, _msg) => {
    // TODO: implement
    return {
      signatureHex: "0x1234",
    };
  };
};
