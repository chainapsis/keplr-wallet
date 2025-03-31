import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  InteractionIdPingMsg,
  InteractionPingMsg,
  PushEventDataMsg,
  PushInteractionDataMsg,
} from "./messages";
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
      case PushEventDataMsg:
        return handlePushEventDataMsg(service)(env, msg as PushEventDataMsg);
      case InteractionPingMsg:
        return handleInteractionPing(service)(env, msg as InteractionPingMsg);
      case InteractionIdPingMsg:
        return handleInteractionIdPing(service)(
          env,
          msg as InteractionIdPingMsg
        );
      default:
        throw new KeplrError("interaction", 110, "Unknown msg type");
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

const handlePushEventDataMsg: (
  service: InteractionForegroundService
) => InternalHandler<PushEventDataMsg> = (service) => {
  return (_, msg) => {
    return service.pushEvent(msg.data);
  };
};

const handleInteractionPing: (
  service: InteractionForegroundService
) => InternalHandler<InteractionPingMsg> = (service) => {
  return (_env, msg) => {
    if (!service.pingHandler) {
      return false;
    }
    return service.pingHandler(msg.windowId, msg.ignoreWindowIdAndForcePing);
  };
};

const handleInteractionIdPing: (
  service: InteractionForegroundService
) => InternalHandler<InteractionIdPingMsg> = (service) => {
  return (_env, msg) => {
    if (!service.interactionIdPingHandler) {
      return false;
    }
    return service.interactionIdPingHandler(msg.interactionId);
  };
};
