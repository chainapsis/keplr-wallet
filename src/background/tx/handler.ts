import { Handler, InternalHandler, Message } from "../../common/message";
import { RequestBackgroundTxMsg } from "./messages";
import { BackgroundTxKeeper } from "./keeper";

export const getHandler: (keeper: BackgroundTxKeeper) => Handler = (
  keeper: BackgroundTxKeeper
) => {
  return (msg: Message<unknown>) => {
    switch (msg.constructor) {
      case RequestBackgroundTxMsg:
        return handleRequestBackgroundTxMsg(keeper)(
          msg as RequestBackgroundTxMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleRequestBackgroundTxMsg: (
  keeper: BackgroundTxKeeper
) => InternalHandler<RequestBackgroundTxMsg> = keeper => {
  return async msg => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await keeper.requestTx(msg.chainId, msg.txBytes, msg.mode!);
    return {};
  };
};
