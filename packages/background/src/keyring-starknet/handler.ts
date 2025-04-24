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
  RequestSignStarknetMessage,
  PrivilegeStarknetSignClaimRewardsMsg,
  CheckNeedEnableAccessForStarknetMsg,
  GetNewCurrentChainIdForStarknetMsg,
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
      case RequestSignStarknetMessage:
        return handleRequestSignStarknetMessage(
          service,
          permissionInteractionService
        )(env, msg as RequestSignStarknetMessage);
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
      case GetNewCurrentChainIdForStarknetMsg:
        return handleGetNewCurrentChainIdForStarknetMsg(service)(
          env,
          msg as GetNewCurrentChainIdForStarknetMsg
        );
      case CheckNeedEnableAccessForStarknetMsg:
        return handleCheckNeedEnableAccessForStarknetMsg(service)(
          env,
          msg as CheckNeedEnableAccessForStarknetMsg
        );
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
      case PrivilegeStarknetSignClaimRewardsMsg:
        return handlePrivilegeStarknetSignClaimRewardsMsg(service)(
          env,
          msg as PrivilegeStarknetSignClaimRewardsMsg
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

const handleRequestSignStarknetMessage: (
  service: KeyRingStarknetService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignStarknetMessage> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabledForStarknet(
      env,
      msg.origin
    );

    return await service.signStarknetMessageSelected(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.message
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
    if (service.checkNeedEnableAccess(msg.method, msg.params)) {
      const newCurrentChainId = service.getNewCurrentChainIdFromRequest(
        msg.method,
        msg.params
      );

      await permissionInteractionService.ensureEnabledForStarknet(
        env,
        msg.origin,
        newCurrentChainId
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

const handleGetNewCurrentChainIdForStarknetMsg: (
  service: KeyRingStarknetService
) => InternalHandler<GetNewCurrentChainIdForStarknetMsg> = (service) => {
  return (_, msg) => {
    return service.getNewCurrentChainIdFromRequest(msg.method, msg.params);
  };
};

const handleCheckNeedEnableAccessForStarknetMsg: (
  service: KeyRingStarknetService
) => InternalHandler<CheckNeedEnableAccessForStarknetMsg> = (service) => {
  return (_, msg) => service.checkNeedEnableAccess(msg.method, msg.params);
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

const handlePrivilegeStarknetSignClaimRewardsMsg: (
  service: KeyRingStarknetService
) => InternalHandler<PrivilegeStarknetSignClaimRewardsMsg> = (service) => {
  return async (env, msg) => {
    return await service.privilegeStarknetSignClaimRewards(
      env,
      msg.origin,
      msg.chainId,
      msg.transactions,
      msg.details
    );
  };
};
