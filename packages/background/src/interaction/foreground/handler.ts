import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { PushInteractionDataMsg } from "./messages";
import { InteractionForegroundService } from "./service";

export const getHandler: (service: InteractionForegroundService) => Handler = (
  service: InteractionForegroundService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case PushInteractionDataMsg:
        return handlePushInteractionDataMsg(service)(
          env,
          msg as PushInteractionDataMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handlePushInteractionDataMsg: (
  service: InteractionForegroundService
) => InternalHandler<PushInteractionDataMsg> = (service) => {
  return (_, msg) => {
    return service.pushData(msg.data);
  };
};
