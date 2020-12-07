import {
  Env,
  Handler,
  InternalHandler,
  Message
} from "../../../common/message";
import { KeyStoreChangedMsg } from "./messages";
import { KeyRingNotifyKeeper } from "./keeper";

export const getHandler: (keeper: KeyRingNotifyKeeper) => Handler = (
  keeper: KeyRingNotifyKeeper
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case KeyStoreChangedMsg:
        return handleKeyStoreChanged(keeper)(env, msg as KeyStoreChangedMsg);
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleKeyStoreChanged: (
  keeper: KeyRingNotifyKeeper
) => InternalHandler<KeyStoreChangedMsg> = keeper => {
  return (_env, _msg) => {
    return keeper.onKeyStoreChanged();
  };
};
