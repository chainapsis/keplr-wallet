import { Handler, Message } from "../../common/message";
import { SetPersistentMemoryMsg, GetPersistentMemoryMsg } from "./messages";

export const getHandler: () => Handler = () => {
  let data = {};

  return (msg: Message) => {
    switch (msg.constructor) {
      case SetPersistentMemoryMsg:
        const setPersistentMemoryMsg = msg as SetPersistentMemoryMsg;
        data = { ...data, ...setPersistentMemoryMsg.data };
        return {
          success: true
        };
      case GetPersistentMemoryMsg:
        return data;
      default:
        throw new Error("Unknown msg type");
    }
  };
};
