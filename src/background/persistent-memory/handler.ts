import { Handler, InternalHandler, Message } from "../../common/message";
import { SetPersistentMemoryMsg, GetPersistentMemoryMsg } from "./messages";
import { PersistentMemoryKeeper } from "./keeper";

export const getHandler: () => Handler = () => {
  const keeper = new PersistentMemoryKeeper();

  return (msg: Message<unknown>) => {
    switch (msg.constructor) {
      case SetPersistentMemoryMsg:
        return handleSetPersistentMemoryMsg(keeper)(
          msg as SetPersistentMemoryMsg
        );
      case GetPersistentMemoryMsg:
        return keeper.get();
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleSetPersistentMemoryMsg: (
  keeper: PersistentMemoryKeeper
) => InternalHandler<SetPersistentMemoryMsg> = (
  keeper: PersistentMemoryKeeper
) => msg => {
  keeper.set(msg.data);
  return {
    success: true
  };
};
