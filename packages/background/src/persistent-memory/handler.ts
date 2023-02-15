import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { SetPersistentMemoryMsg, GetPersistentMemoryMsg } from "./messages";
import { PersistentMemoryService } from "./service";

export const getHandler: (service: PersistentMemoryService) => Handler = (
  service
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case SetPersistentMemoryMsg:
        return handleSetPersistentMemoryMsg(service)(
          env,
          msg as SetPersistentMemoryMsg
        );
      case GetPersistentMemoryMsg:
        return service.get();
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleSetPersistentMemoryMsg: (
  service: PersistentMemoryService
) => InternalHandler<SetPersistentMemoryMsg> =
  (service: PersistentMemoryService) => (_, msg) => {
    service.set(msg.data);
    return {
      success: true,
    };
  };
