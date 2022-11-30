import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { PhishingListService } from "./service";
import {
  CheckURLIsPhishingMsg,
  URLTempAllowMsg,
  CheckBadTwitterIdMsg,
} from "./messages";

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
      case URLTempAllowMsg:
        return handleURLTempAllow(service)(env, msg as URLTempAllowMsg);
      case CheckBadTwitterIdMsg:
        return handleCheckBadTwitterId(service)(
          env,
          msg as CheckBadTwitterIdMsg
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

const handleURLTempAllow: (
  service: PhishingListService
) => InternalHandler<URLTempAllowMsg> = (service: PhishingListService) => (
  _,
  msg
) => {
  service.allowUrlTemp(msg.url);
};

const handleCheckBadTwitterId: (
  service: PhishingListService
) => InternalHandler<CheckBadTwitterIdMsg> = (service: PhishingListService) => (
  _,
  msg
) => {
  return service.checkBadTwitterId(msg.id);
};
