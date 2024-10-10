import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  GetStarknetKeyMsg,
  GetStarknetKeysSettledMsg,
  RequestSignStarknetTx,
  RequestSignStarknetDeployAccountTx,
  RequestJsonRpcToStarknetMsg,
  GetStarknetKeysForEachVaultSettledMsg,
  GetStarknetKeyParamsSelectedMsg,
} from "./messages";
import { KeyRingStarknetService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: KeyRingStarknetService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (
  service: KeyRingStarknetService,
  permissionInteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetStarknetKeyMsg:
        return handleGetStarknetKeyMsg(service, permissionInteractionService)(
          env,
          msg as GetStarknetKeyMsg
        );
      case GetStarknetKeysSettledMsg:
        return handleGetStarknetKeysSettledMsg(
          service,
          permissionInteractionService
        )(env, msg as GetStarknetKeysSettledMsg);
      case RequestSignStarknetTx:
        return handleRequestSignStarknetTx(
          service,
          permissionInteractionService
        )(env, msg as RequestSignStarknetTx);
      case RequestSignStarknetDeployAccountTx:
        return handleRequestSignStarknetDeployAccountTx(
          service,
          permissionInteractionService
        )(env, msg as RequestSignStarknetDeployAccountTx);
      case RequestJsonRpcToStarknetMsg:
        return handleRequestJsonRpcToStarknetMsg(
          service,
          permissionInteractionService
        )(env, msg as RequestJsonRpcToStarknetMsg);
      case GetStarknetKeysForEachVaultSettledMsg:
        return handleGetStarknetKeysForEachVaultSettledMsg(service)(
          env,
          msg as GetStarknetKeysForEachVaultSettledMsg
        );
      case GetStarknetKeyParamsSelectedMsg:
        return handleGetStarknetKeyParamsSelectedMsg(service)(
          env,
          msg as GetStarknetKeyParamsSelectedMsg
        );
      default:
        throw new KeplrError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleGetStarknetKeyMsg: (
  service: KeyRingStarknetService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetStarknetKeyMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForStarknet(
      env,
      msg.origin
    );

    return await service.getStarknetKeySelected(msg.chainId);
  };
};

const handleGetStarknetKeysSettledMsg: (
  service: KeyRingStarknetService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetStarknetKeysSettledMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForStarknet(
      env,
      msg.origin
    );

    return await Promise.allSettled(
      msg.chainIds.map((chainId) => service.getStarknetKeySelected(chainId))
    );
  };
};

const handleRequestSignStarknetTx: (
  service: KeyRingStarknetService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignStarknetTx> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForStarknet(
      env,
      msg.origin
    );

    return await service.signStarknetTransactionSelected(
      env,
      msg.origin,
      msg.chainId,
      msg.transactions,
      msg.details,
      false
    );
  };
};

const handleRequestSignStarknetDeployAccountTx: (
  service: KeyRingStarknetService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignStarknetDeployAccountTx> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForStarknet(
      env,
      msg.origin
    );

    return await service.signStarknetDeployAccountTransactionSelected(
      env,
      msg.origin,
      msg.chainId,
      msg.transaction
    );
  };
};

const handleRequestJsonRpcToStarknetMsg: (
  service: KeyRingStarknetService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestJsonRpcToStarknetMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    if (msg.method !== "keplr_initStarknetProviderState") {
      await permissionInteractionService.ensureEnabledForStarknet(
        env,
        msg.origin
      );
    }

    return await service.request(
      env,
      msg.origin,
      msg.method,
      msg.params,
      msg.chainId
    );
  };
};

const handleGetStarknetKeysForEachVaultSettledMsg: (
  service: KeyRingStarknetService
) => InternalHandler<GetStarknetKeysForEachVaultSettledMsg> = (service) => {
  return async (_, msg) => {
    return await Promise.allSettled(
      msg.vaultIds.map((vaultId) =>
        (async () => {
          const key = await service.getStarknetKey(vaultId, msg.chainId);
          return {
            vaultId,
            ...key,
          };
        })()
      )
    );
  };
};

const handleGetStarknetKeyParamsSelectedMsg: (
  service: KeyRingStarknetService
) => InternalHandler<GetStarknetKeyParamsSelectedMsg> = (service) => {
  return async (_, msg) => {
    return await service.getStarknetKeyParamsSelected(msg.chainId);
  };
};
