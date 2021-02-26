import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { ChainUpdaterService } from "./service";
import { TryUpdateChainMsg } from "./messages";

export const getHandler: (service: ChainUpdaterService) => Handler = (
  service
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case TryUpdateChainMsg:
        return handleTryUpdateChainMsg(service)(env, msg as TryUpdateChainMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleTryUpdateChainMsg: (
  service: ChainUpdaterService
) => InternalHandler<TryUpdateChainMsg> = (service) => {
  return async (_, msg) => {
    await service.tryUpdateChain(msg.chainId);
  };
};
