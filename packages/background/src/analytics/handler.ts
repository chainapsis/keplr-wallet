import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import {
  GetAnalyticsIdMsg,
  LogAnalyticsEventMsg,
  SetDisableAnalyticsMsg,
} from "./messages";
import { AnalyticsService } from "./service";

export const getHandler: (service: AnalyticsService) => Handler = (service) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetAnalyticsIdMsg:
        return handleGetAnalyticsIdMsg(service)(env, msg as GetAnalyticsIdMsg);
      case SetDisableAnalyticsMsg:
        return handleSetDisableAnalyticsMsg(service)(
          env,
          msg as SetDisableAnalyticsMsg
        );
      case LogAnalyticsEventMsg:
        return handleLogAnalyticsEventMsg(service)(
          env,
          msg as LogAnalyticsEventMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleGetAnalyticsIdMsg: (
  service: AnalyticsService
) => InternalHandler<GetAnalyticsIdMsg> =
  (service: AnalyticsService) => (env, msg) => {
    return service.getAnalyticsIdOnlyIfPrivileged(env, msg.origin);
  };

const handleSetDisableAnalyticsMsg: (
  service: AnalyticsService
) => InternalHandler<SetDisableAnalyticsMsg> = (service) => (_, msg) => {
  return service.setDisabled(msg.disabled);
};

const handleLogAnalyticsEventMsg: (
  service: AnalyticsService
) => InternalHandler<LogAnalyticsEventMsg> = (service) => (_, msg) => {
  return service.logEventIgnoreError(msg.event, msg.params);
};
