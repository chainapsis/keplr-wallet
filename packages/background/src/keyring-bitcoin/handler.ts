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
  GetSupportedPaymentTypesMsg,
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
        return handleGetBitcoinKeysForEachVaultSettledMsg(_service)(
          env,
          msg as GetBitcoinKeysForEachVaultSettledMsg
        );
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
      case GetSupportedPaymentTypesMsg:
        return handleGetSupportedPaymentTypesMsg(_service)(
          env,
          msg as GetSupportedPaymentTypesMsg
        );
      default:
        throw new KeplrError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleGetBitcoinKeyMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetBitcoinKeyMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.getBitcoinKeySelected(msg.chainId);
  };
};

const handleGetBitcoinKeysSettledMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetBitcoinKeysSettledMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await Promise.allSettled(
      msg.chainConfigs.map((chainConfig) =>
        service.getBitcoinKeySelected(chainConfig.chainId)
      )
    );
  };
};

const handleGetBitcoinKeysForEachVaultSettledMsg: (
  service: KeyRingBitcoinService
) => InternalHandler<GetBitcoinKeysForEachVaultSettledMsg> = (service) => {
  return async (_, msg) => {
    return await Promise.allSettled(
      msg.vaultIds.map((vaultId) =>
        (async () => {
          const key = await service.getBitcoinKey(vaultId, msg.chainId);
          return {
            vaultId,
            ...key,
          };
        })()
      )
    );
  };
};

const handleRequestSignBitcoinPsbtMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignBitcoinPsbtMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.signPsbtSelected(
      env,
      msg.origin,
      msg.chainId,
      msg.psbt
    );
  };
};

const handleRequestSignBitcoinPsbtsMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignBitcoinPsbtsMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.signPsbtsSelected(
      env,
      msg.origin,
      msg.chainId,
      msg.psbts
    );
  };
};

const handleRequestSignBitcoinMessageMsg: (
  service: KeyRingBitcoinService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignBitcoinMessageMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForBitcoin(env, msg.origin);

    return await service.signMessageSelected(
      env,
      msg.origin,
      msg.chainId,
      msg.message,
      msg.signType
    );
  };
};

const handleGetSupportedPaymentTypesMsg: (
  service: KeyRingBitcoinService
) => InternalHandler<GetSupportedPaymentTypesMsg> = (service) => {
  return async (_) => {
    return await service.getSupportedPaymentTypes();
  };
};
