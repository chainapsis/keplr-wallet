import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { EnabledChainIdentifiersUpdatedMsg } from "./messages";
import { ChainsUIForegroundService } from "./service";

export const getHandler: (service: ChainsUIForegroundService) => Handler = (
  service: ChainsUIForegroundService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case EnabledChainIdentifiersUpdatedMsg:
        return handleEnabledChainIdentifiersUpdatedMsg(service)(
          env,
          msg as EnabledChainIdentifiersUpdatedMsg
        );
      default:
        throw new KeplrError("interaction", 110, "Unknown msg type");
    }
  };
};

const handleEnabledChainIdentifiersUpdatedMsg: (
  service: ChainsUIForegroundService
) => InternalHandler<EnabledChainIdentifiersUpdatedMsg> = (service) => {
  return (_, msg) => {
    return service.invoke(msg);
  };
};
