import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { PhishingListService } from "./service";
import {
  CheckURLIsPhishingMsg,
  URLTempAllowMsg,
  CheckBadTwitterIdMsg,
  CheckURLIsPhishingOnMobileMsg,
  URLTempAllowOnMobileMsg,
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
      case CheckURLIsPhishingOnMobileMsg:
        return handleCheckURLIsPhishingOnMobileMsg(service)(
          env,
          msg as CheckURLIsPhishingOnMobileMsg
        );
      case URLTempAllowMsg:
        return handleURLTempAllow(service)(env, msg as URLTempAllowMsg);
      case URLTempAllowOnMobileMsg:
        return handleURLTempAllowOnMobileMsg(service)(
          env,
          msg as URLTempAllowOnMobileMsg
        );
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
) => InternalHandler<CheckURLIsPhishingMsg> =
  (service: PhishingListService) => (_, msg) => {
    return service.checkURLIsPhishing(msg.origin);
  };

const handleCheckURLIsPhishingOnMobileMsg: (
  service: PhishingListService
) => InternalHandler<CheckURLIsPhishingOnMobileMsg> =
  (service: PhishingListService) => (_, msg) => {
    return service.checkURLIsPhishing(msg.url);
  };

const handleURLTempAllow: (
  service: PhishingListService
) => InternalHandler<URLTempAllowMsg> =
  (service: PhishingListService) => (_, msg) => {
    const blocklistPageURL = new URL(msg.origin);
    if (blocklistPageURL.origin !== new URL(service.blocklistPageURL).origin) {
      throw new Error("Permission rejected");
    }

    service.allowUrlTemp(msg.url);
  };

const handleURLTempAllowOnMobileMsg: (
  service: PhishingListService
) => InternalHandler<URLTempAllowOnMobileMsg> =
  (service: PhishingListService) => (_, msg) => {
    const blocklistPageURL = new URL(msg.currentUrl);

    if (blocklistPageURL.origin !== new URL(service.blocklistPageURL).origin) {
      throw new Error("Permission rejected");
    }

    service.allowUrlTemp(msg.originUrl);
  };

const handleCheckBadTwitterId: (
  service: PhishingListService
) => InternalHandler<CheckBadTwitterIdMsg> =
  (service: PhishingListService) => (_, msg) => {
    return service.checkBadTwitterId(msg.id);
  };
