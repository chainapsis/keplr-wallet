import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { GetStarknetKeyMsg, GetStarknetKeysSettledMsg } from "./messages";
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
