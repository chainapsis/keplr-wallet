import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { GetCosmosKeyMsg, GetCosmosKeysSettledMsg } from "./messages";
import { KeyRingCosmosService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (
  service: KeyRingCosmosService,
  permissionInteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetCosmosKeyMsg:
        return handleGetCosmosKeyMsg(service, permissionInteractionService)(
          env,
          msg as GetCosmosKeyMsg
        );
      case GetCosmosKeysSettledMsg:
        return handleGetCosmosKeysSettledMsg(
          service,
          permissionInteractionService
        )(env, msg as GetCosmosKeysSettledMsg);
      default:
        throw new KeplrError("keyring", 221, "Unknown msg type");
    }
  };
};

const handleGetCosmosKeyMsg: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetCosmosKeyMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.getKeySelected(env, msg.chainId);
  };
};

const handleGetCosmosKeysSettledMsg: (
  service: KeyRingCosmosService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<GetCosmosKeysSettledMsg> = (
  service,
  permissionInteractionService
) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      msg.chainIds,
      msg.origin
    );

    return await Promise.allSettled(
      msg.chainIds.map((chainId) => service.getKeySelected(env, chainId))
    );
  };
};
