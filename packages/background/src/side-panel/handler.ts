import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { SidePanelService } from "./service";
import {
  GetSidePanelIsSupportedMsg,
  GetSidePanelEnabledMsg,
  SetSidePanelEnabledMsg,
} from "./messages";

export const getHandler: (service: SidePanelService) => Handler = (
  service: SidePanelService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetSidePanelIsSupportedMsg:
        return handleGetSidePanelIsSupportedMsg(service)(
          env,
          msg as GetSidePanelIsSupportedMsg
        );
      case GetSidePanelEnabledMsg:
        return handleGetSidePanelEnabledMsg(service)(
          env,
          msg as GetSidePanelEnabledMsg
        );
      case SetSidePanelEnabledMsg:
        return handleSetSidePanelEnabledMsg(service)(
          env,
          msg as SetSidePanelEnabledMsg
        );
      default:
        throw new KeplrError("sidePanll", 221, "Unknown msg type");
    }
  };
};

const handleGetSidePanelIsSupportedMsg: (
  service: SidePanelService
) => InternalHandler<GetSidePanelIsSupportedMsg> = (service) => {
  return () => {
    return {
      supported: service.isSidePanelSupported(),
    };
  };
};

const handleGetSidePanelEnabledMsg: (
  service: SidePanelService
) => InternalHandler<GetSidePanelEnabledMsg> = (service) => {
  return () => {
    return {
      enabled: service.getIsEnabled(),
    };
  };
};

const handleSetSidePanelEnabledMsg: (
  service: SidePanelService
) => InternalHandler<SetSidePanelEnabledMsg> = (service) => {
  return (_, msg) => {
    service.setIsEnabled(msg.enabled);
    return {
      enabled: service.getIsEnabled(),
    };
  };
};
