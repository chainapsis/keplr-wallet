import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { ApproveInteractionMsg, RejectInteractionMsg } from "./messages";
import { InteractionService } from "./service";

export const getHandler: (service: InteractionService) => Handler = (
  service: InteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case ApproveInteractionMsg:
        return handleApproveInteractionMsg(service)(
          env,
          msg as ApproveInteractionMsg
        );
      case RejectInteractionMsg:
        return handleRejectInteractionMsg(service)(
          env,
          msg as RejectInteractionMsg
        );
      default:
        throw new KeplrError("interaction", 100, "Unknown msg type");
    }
  };
};

const handleApproveInteractionMsg: (
  service: InteractionService
) => InternalHandler<ApproveInteractionMsg> = (service) => {
  return (_, msg) => {
    return service.approve(msg.id, msg.result);
  };
};

const handleRejectInteractionMsg: (
  service: InteractionService
) => InternalHandler<RejectInteractionMsg> = (service) => {
  return (_, msg) => {
    return service.reject(msg.id);
  };
};
