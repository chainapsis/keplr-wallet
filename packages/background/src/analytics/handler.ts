import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { GetAnalyticsIdMsg } from "./messages";
import { AnalyticsService } from "./service";

export const getHandler: (service: AnalyticsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetAnalyticsIdMsg:
        return handleGetAnalyticsIdMsg(service)(env, msg as GetAnalyticsIdMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetAnalyticsIdMsg: (
  service: AnalyticsService
) => InternalHandler<GetAnalyticsIdMsg> = (service: AnalyticsService) => (
  env,
  msg
) => {
  return service.getAnalyticsIdOnlyIfPrivileged(env, msg.origin);
};
