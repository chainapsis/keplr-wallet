import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  ApproveInteractionMsg,
  RejectInteractionMsg,
  ApproveInteractionV2Msg,
  RejectInteractionV2Msg,
  GetInteractionWaitingDataArrayMsg,
  PingContentScriptTabHasOpenedSidePanelMsg,
} from "./messages";
import { InteractionService } from "./service";

export const getHandler: (service: InteractionService) => Handler = (
  service: InteractionService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetInteractionWaitingDataArrayMsg:
        return handleGetInteractionWaitingDataArrayMsg(service)(
          env,
          msg as GetInteractionWaitingDataArrayMsg
        );
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
      case ApproveInteractionV2Msg:
        return handleApproveInteractionV2Msg(service)(
          env,
          msg as ApproveInteractionV2Msg
        );
      case RejectInteractionV2Msg:
        return handleRejectInteractionV2Msg(service)(
          env,
          msg as RejectInteractionV2Msg
        );
      case PingContentScriptTabHasOpenedSidePanelMsg:
        return handlePingContentScriptTabHasOpenedSidePanelMsg(service)(
          env,
          msg as PingContentScriptTabHasOpenedSidePanelMsg
        );
      default:
        throw new KeplrError("interaction", 100, "Unknown msg type");
    }
  };
};

const handleGetInteractionWaitingDataArrayMsg: (
  service: InteractionService
) => InternalHandler<GetInteractionWaitingDataArrayMsg> = (service) => {
  return (_env, _msg) => {
    return service.getInteractionWaitingDataArray();
  };
};

const handleApproveInteractionMsg: (
  service: InteractionService
) => InternalHandler<ApproveInteractionMsg> = (service) => {
  return (_, msg) => {
    return service.approve(msg.id, msg.result);
  };
};

const handleApproveInteractionV2Msg: (
  service: InteractionService
) => InternalHandler<ApproveInteractionV2Msg> = (service) => {
  return (_, msg) => {
    return service.approveV2(msg.id, msg.result);
  };
};

const handleRejectInteractionMsg: (
  service: InteractionService
) => InternalHandler<RejectInteractionMsg> = (service) => {
  return (_, msg) => {
    return service.reject(msg.id);
  };
};

const handleRejectInteractionV2Msg: (
  service: InteractionService
) => InternalHandler<RejectInteractionV2Msg> = (service) => {
  return (_, msg) => {
    return service.rejectV2(msg.id);
  };
};

const handlePingContentScriptTabHasOpenedSidePanelMsg: (
  service: InteractionService
) => InternalHandler<PingContentScriptTabHasOpenedSidePanelMsg> = (service) => {
  return async (env) => {
    if (!env.sender.tab || env.sender.tab.id == null) {
      return false;
    }

    return await service.pingContentScriptTabHasOpenedSidePanel(
      env.sender.tab.id
    );
  };
};
