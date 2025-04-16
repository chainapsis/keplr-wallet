import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  RequestSignEthereumMsg,
  RequestJsonRpcToEvmMsg,
  GetNewCurrentChainIdForEVMMsg,
} from "./messages";
import { KeyRingEthereumService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";
import { enableAccessSkippedJSONRPCMethods } from "./constants";

export const getHandler: (
  service: KeyRingEthereumService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (
  service: KeyRingEthereumService,
  permissionInteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case RequestSignEthereumMsg:
        return handleRequestSignEthereumMsg(
          service,
          permissionInteractionService
        )(env, msg as RequestSignEthereumMsg);
      case RequestJsonRpcToEvmMsg:
        return handleRequestJsonRpcToEvmMsg(
          service,
          permissionInteractionService
        )(env, msg as RequestJsonRpcToEvmMsg);
      case GetNewCurrentChainIdForEVMMsg:
        return handleGetNewCurrentChainIdForEVMMsg(service)(
          env,
          msg as GetNewCurrentChainIdForEVMMsg
        );
      default:
        throw new KeplrError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleRequestSignEthereumMsg: (
  service: KeyRingEthereumService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestSignEthereumMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return (
      await service.signEthereumSelected(
        env,
        msg.origin,
        msg.chainId,
        msg.signer,
        msg.message,
        msg.signType
      )
    ).signature;
  };
};

const handleRequestJsonRpcToEvmMsg: (
  service: KeyRingEthereumService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<RequestJsonRpcToEvmMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    if (!enableAccessSkippedJSONRPCMethods.includes(msg.method)) {
      const newCurrentChainId = service.getNewCurrentChainIdFromRequest(
        msg.method,
        msg.params
      );

      await permissionInteractionService.ensureEnabledForEVM(
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
      msg.providerId,
      msg.chainId
    );
  };
};

const handleGetNewCurrentChainIdForEVMMsg: (
  service: KeyRingEthereumService
) => InternalHandler<GetNewCurrentChainIdForEVMMsg> = (service) => {
  return async (_, msg) => {
    return service.getNewCurrentChainIdFromRequest(msg.method, msg.params);
  };
};
