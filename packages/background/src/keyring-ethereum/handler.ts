import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { RequestSignEthereumMsg } from "./messages";
import { KeyRingEthereumService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

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

    return await service.signEthereumSelected(
      env,
      msg.origin,
      msg.chainId,
      msg.signer,
      msg.message,
      msg.signType
    );
  };
};
