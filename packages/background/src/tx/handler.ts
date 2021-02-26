import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import {
  RequestBackgroundTxMsg,
  RequestBackgroundTxWithResultMsg,
  SendTxMsg,
} from "./messages";
import { BackgroundTxService } from "./service";

export const getHandler: (service: BackgroundTxService) => Handler = (
  service: BackgroundTxService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case SendTxMsg:
        return handleSendTxMsg(service)(env, msg as SendTxMsg);
      case RequestBackgroundTxMsg:
        return handleRequestBackgroundTxMsg(service)(
          env,
          msg as RequestBackgroundTxMsg
        );
      case RequestBackgroundTxWithResultMsg:
        return handleRequestBackgroundTxWithResultMsg(service)(
          env,
          msg as RequestBackgroundTxWithResultMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleSendTxMsg: (
  service: BackgroundTxService
) => InternalHandler<SendTxMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );

    return await service.sendTx(msg.chainId, msg.tx, msg.mode);
  };
};

const handleRequestBackgroundTxMsg: (
  service: BackgroundTxService
) => InternalHandler<RequestBackgroundTxMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await service.requestTx(msg.chainId, msg.txBytes, msg.mode!, msg.isRestAPI);
  };
};

const handleRequestBackgroundTxWithResultMsg: (
  service: BackgroundTxService
) => InternalHandler<RequestBackgroundTxWithResultMsg> = (service) => {
  return async (env, msg) => {
    await service.permissionService.checkOrGrantBasicAccessPermission(
      env,
      msg.chainId,
      msg.origin
    );
    return await service.requestTxWithResult(
      msg.chainId,
      msg.txBytes,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      msg.mode!,
      msg.isRestAPI
    );
  };
};
