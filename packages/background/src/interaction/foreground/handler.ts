import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { PushEventDataMsg, PushInteractionDataMsg } from "./messages";
import { InteractionForegroundService } from "./service";

export const getHandler: (service: InteractionForegroundService) => Handler = (
  service: InteractionForegroundService
) => {
  return (env: Env, msg: Message<unknown>) => {
    console.log("interaction foreground handler", msg);
    switch (msg.constructor) {
      case PushInteractionDataMsg:
        return handlePushInteractionDataMsg(service)(
          env,
          msg as PushInteractionDataMsg
        );
      case PushEventDataMsg:
        return handlePushEventDataMsg(service)(env, msg as PushEventDataMsg);
      default:
        throw new KeplrError("interaction", 110, "Unknown msg type");
    }
  };
};

const handlePushInteractionDataMsg: (
  service: InteractionForegroundService
) => InternalHandler<PushInteractionDataMsg> = (service) => {
  return (_, msg) => {
    console.log('push interaction data', msg.data)
    return service.pushData(msg.data);
  };
};

const handlePushEventDataMsg: (
  service: InteractionForegroundService
) => InternalHandler<PushEventDataMsg> = (service) => {
  return (_, msg) => {
    return service.pushEvent(msg.data);
  };
};
