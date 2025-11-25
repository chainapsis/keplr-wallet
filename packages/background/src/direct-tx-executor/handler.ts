import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { DirectTxExecutorService } from "./service";
import { GetDirectTxExecutorDataMsg } from "./messages";

export const getHandler: (service: DirectTxExecutorService) => Handler = (
  service: DirectTxExecutorService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetDirectTxExecutorDataMsg:
        return handleGetDirectTxExecutorDataMsg(service)(
          env,
          msg as GetDirectTxExecutorDataMsg
        );
      default:
        throw new KeplrError("direct-tx-executor", 100, "Unknown msg type");
    }
  };
};

const handleGetDirectTxExecutorDataMsg: (
  service: DirectTxExecutorService
) => InternalHandler<GetDirectTxExecutorDataMsg> = (_service) => {
  return async (_env, _msg) => {
    throw new KeplrError("direct-tx-executor", 100, "Not implemented");
  };
};
