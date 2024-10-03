import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { SendTxMsg, SubmitStarknetTxHashMsg } from "./messages";
import { BackgroundTxService } from "./service";
import { PermissionInteractiveService } from "../permission-interactive";

export const getHandler: (
  service: BackgroundTxService,
  permissionInteractionService: PermissionInteractiveService
) => Handler = (service: BackgroundTxService, permissionInteractionService) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case SendTxMsg:
        return handleSendTxMsg(service, permissionInteractionService)(
          env,
          msg as SendTxMsg
        );
      case SubmitStarknetTxHashMsg:
        return handleSubmitStarknetTxHashMsg(service)(
          env,
          msg as SubmitStarknetTxHashMsg
        );
      default:
        throw new KeplrError("tx", 110, "Unknown msg type");
    }
  };
};

const handleSendTxMsg: (
  service: BackgroundTxService,
  permissionInteractionService: PermissionInteractiveService
) => InternalHandler<SendTxMsg> = (service, permissionInteractionService) => {
  return async (env, msg) => {
    await permissionInteractionService.ensureEnabled(
      env,
      [msg.chainId],
      msg.origin
    );

    return await service.sendTx(msg.chainId, msg.tx, msg.mode, {
      silent: msg.silent,
    });
  };
};

const handleSubmitStarknetTxHashMsg: (
  service: BackgroundTxService
) => InternalHandler<SubmitStarknetTxHashMsg> = (service) => {
  return async (_, msg) => {
    return service.waitStarknetTransaction(msg.chainId, msg.txHash);
  };
};
