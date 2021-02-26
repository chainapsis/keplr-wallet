import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { KeyStoreChangedEventMsg } from "./messages";
import { KeyStoreEventService } from "./service";

export const getHandler: (service: KeyStoreEventService) => Handler = (
  service: KeyStoreEventService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case KeyStoreChangedEventMsg:
        return handleKeyStoreChangedEventMsg(service)(
          env,
          msg as KeyStoreChangedEventMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleKeyStoreChangedEventMsg: (
  service: KeyStoreEventService
) => InternalHandler<KeyStoreChangedEventMsg> = (service) => {
  return (_env, _msg) => {
    return service.keyStoreChanged();
  };
};
