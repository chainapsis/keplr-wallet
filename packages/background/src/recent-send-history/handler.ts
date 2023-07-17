import {
  Env,
  Handler,
  InternalHandler,
  KeplrError,
  Message,
} from "@keplr-wallet/router";
import {
  GetRecentSendHistoriesMsg,
  SendTxAndRecordMsg,
  SendTxAndRecordWithIBCPacketForwardingMsg,
} from "./messages";
import { RecentSendHistoryService } from "./service";

export const getHandler: (service: RecentSendHistoryService) => Handler = (
  service: RecentSendHistoryService
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case GetRecentSendHistoriesMsg:
        return handleGetRecentSendHistoriesMsg(service)(
          env,
          msg as GetRecentSendHistoriesMsg
        );
      case SendTxAndRecordMsg:
        return handleSendTxAndRecordMsg(service)(
          env,
          msg as SendTxAndRecordMsg
        );
      case SendTxAndRecordWithIBCPacketForwardingMsg:
        return handleSendTxAndRecordWithIBCPacketForwardingMsg(service)(
          env,
          msg as SendTxAndRecordWithIBCPacketForwardingMsg
        );
      default:
        throw new KeplrError("tx", 110, "Unknown msg type");
    }
  };
};

const handleGetRecentSendHistoriesMsg: (
  service: RecentSendHistoryService
) => InternalHandler<GetRecentSendHistoriesMsg> = (service) => {
  return (_env, msg) => {
    return service.getRecentSendHistories(msg.chainId, msg.historyType);
  };
};

const handleSendTxAndRecordMsg: (
  service: RecentSendHistoryService
) => InternalHandler<SendTxAndRecordMsg> = (service) => {
  return (_env, msg) => {
    return service.sendTxAndRecord(
      msg.historyType,
      msg.sourceChainId,
      msg.destinationChainId,
      msg.tx,
      msg.mode,
      msg.silent,
      msg.sender,
      msg.recipient,
      msg.amount,
      msg.memo,
      undefined
    );
  };
};

const handleSendTxAndRecordWithIBCPacketForwardingMsg: (
  service: RecentSendHistoryService
) => InternalHandler<SendTxAndRecordWithIBCPacketForwardingMsg> = (service) => {
  return async (_env, msg) => {
    return await service.sendTxAndRecord(
      msg.historyType,
      msg.sourceChainId,
      msg.destinationChainId,
      msg.tx,
      msg.mode,
      msg.silent,
      msg.sender,
      msg.recipient,
      msg.amount,
      msg.memo,
      msg.channels
    );
  };
};
