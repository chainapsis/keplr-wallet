import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import { SidePanelService } from "./service";
import { GetSidePanelEnabledMsg } from "./messages";

export const getHandler: (service: SidePanelService) => Handler = (
  service: SidePanelService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetSidePanelEnabledMsg:
        return handleGetSidePanelEnabledMsg(service)(
          env,
          msg as GetSidePanelEnabledMsg
        );
      default:
        throw new KeplrError("sidePanll", 221, "Unknown msg type");
    }
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
