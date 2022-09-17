import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { PhishingListService } from "./service";
import { CheckURLIsPhishingMsg } from "./messages";

export const getHandler: (service: PhishingListService) => Handler = (
  service: PhishingListService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case CheckURLIsPhishingMsg:
        return handleCheckURLIsPhishingMsg(service)(
          env,
          msg as CheckURLIsPhishingMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleCheckURLIsPhishingMsg: (
  service: PhishingListService
) => InternalHandler<CheckURLIsPhishingMsg> = (
  service: PhishingListService
) => (_, msg) => {
  return service.checkURLIsPhishing(msg.origin);
};
